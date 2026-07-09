<?php

namespace App\Modules\Order\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Exceptions\EventAccessDeniedException;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Exceptions\CheckoutException;
use App\Modules\Order\Models\FormField;
use App\Modules\Order\Models\FormFieldOption;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Models\RegistrationAnswer;
use App\Modules\Order\Models\RegistrationForm;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegistrationFormService
{
    /** @var list<string> */
    private const SUPPORTED_TYPES = ['text', 'email', 'phone', 'textarea', 'select', 'checkbox'];

    public function __construct(
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function getOrCreateForEvent(Event $event): RegistrationForm
    {
        return RegistrationForm::query()->firstOrCreate(
            ['event_id' => $event->id],
            [
                'organizer_id' => $event->organizer_id,
                'title' => 'Formulir Pendaftaran',
                'is_active' => true,
            ]
        );
    }

    public function showForOrganizer(Event $event, User $user): RegistrationForm
    {
        $this->assertCanManage($event, $user);

        return $this->getOrCreateForEvent($event)->load(['fields.options']);
    }

    public function showPublic(Event $event): RegistrationForm
    {
        $form = RegistrationForm::query()
            ->where('event_id', $event->id)
            ->where('is_active', true)
            ->with(['activeFields.options'])
            ->first();

        if ($form === null) {
            $empty = new RegistrationForm([
                'event_id' => $event->id,
                'organizer_id' => $event->organizer_id,
                'title' => 'Formulir Pendaftaran',
                'is_active' => true,
            ]);
            $empty->setRelation('fields', collect());

            return $empty;
        }

        $form->setRelation('fields', $form->activeFields);

        return $form;
    }

    /**
     * @param  list<array<string, mixed>>  $fields
     */
    public function syncFields(Event $event, User $user, array $fields): RegistrationForm
    {
        $this->assertCanManage($event, $user);

        return DB::transaction(function () use ($event, $fields) {
            $form = $this->getOrCreateForEvent($event);
            $existingIds = [];

            foreach (array_values($fields) as $index => $fieldData) {
                $name = $this->resolveFieldName((string) ($fieldData['name'] ?? ''), (string) ($fieldData['label'] ?? 'field'));
                $type = (string) ($fieldData['type'] ?? 'text');

                if (! in_array($type, self::SUPPORTED_TYPES, true)) {
                    continue;
                }

                $field = FormField::query()->updateOrCreate(
                    [
                        'form_id' => $form->id,
                        'name' => $name,
                    ],
                    [
                        'organizer_id' => $event->organizer_id,
                        'label' => (string) ($fieldData['label'] ?? $name),
                        'type' => $type,
                        'placeholder' => $fieldData['placeholder'] ?? null,
                        'help_text' => $fieldData['help_text'] ?? null,
                        'is_required' => (bool) ($fieldData['is_required'] ?? false),
                        'sort_order' => (int) ($fieldData['sort_order'] ?? $index),
                        'is_active' => (bool) ($fieldData['is_active'] ?? true),
                    ]
                );

                $existingIds[] = $field->id;

                if ($type === 'select') {
                    $this->syncOptions($field, $event->organizer_id, $fieldData['options'] ?? []);
                } else {
                    $field->options()->delete();
                }
            }

            FormField::query()
                ->where('form_id', $form->id)
                ->whereNotIn('id', $existingIds)
                ->delete();

            return $form->fresh(['fields.options']);
        });
    }

    /**
     * @param  list<array<string, mixed>>  $answers
     * @return list<array{field: FormField, value: mixed}>
     */
    public function validateAnswers(Event $event, array $answers): array
    {
        $form = $this->showPublic($event);
        $fields = $form->relationLoaded('fields') ? $form->fields : collect();
        $fieldMap = $fields->keyBy('id');
        $validated = [];

        foreach ($fields as $field) {
            if (! $field->is_required) {
                continue;
            }

            $answer = collect($answers)->first(fn ($item) => (int) ($item['field_id'] ?? 0) === $field->id);
            $value = $answer['value'] ?? null;

            if ($value === null || (is_string($value) && trim($value) === '')) {
                throw CheckoutException::make("Field {$field->label} wajib diisi.");
            }
        }

        foreach ($answers as $answer) {
            $fieldId = (int) ($answer['field_id'] ?? 0);
            $field = $fieldMap->get($fieldId);

            if ($field === null) {
                continue;
            }

            $validated[] = [
                'field' => $field,
                'value' => $answer['value'] ?? null,
            ];
        }

        return $validated;
    }

    /**
     * @param  list<array{field: FormField, value: mixed}>  $validatedAnswers
     */
    public function saveAnswers(Registration $registration, array $validatedAnswers): void
    {
        foreach ($validatedAnswers as $item) {
            /** @var FormField $field */
            $field = $item['field'];
            $value = $item['value'];

            RegistrationAnswer::query()->updateOrCreate(
                [
                    'registration_id' => $registration->id,
                    'form_field_id' => $field->id,
                ],
                [
                    'organizer_id' => $registration->organizer_id,
                    'event_id' => $registration->event_id,
                    'field_name' => $field->name,
                    'field_label' => $field->label,
                    'value_text' => is_scalar($value) ? (string) $value : null,
                    'value_json' => is_array($value) ? $value : null,
                ]
            );
        }
    }

    /**
     * @param  list<array<string, mixed>>  $options
     */
    private function syncOptions(FormField $field, int $organizerId, array $options): void
    {
        $existingIds = [];

        foreach (array_values($options) as $index => $option) {
            $label = (string) ($option['label'] ?? '');
            $value = (string) ($option['value'] ?? $label);

            if ($label === '') {
                continue;
            }

            $model = FormFieldOption::query()->updateOrCreate(
                [
                    'field_id' => $field->id,
                    'value' => $value,
                ],
                [
                    'organizer_id' => $organizerId,
                    'label' => $label,
                    'sort_order' => (int) ($option['sort_order'] ?? $index),
                ]
            );

            $existingIds[] = $model->id;
        }

        FormFieldOption::query()
            ->where('field_id', $field->id)
            ->whereNotIn('id', $existingIds)
            ->delete();
    }

    private function resolveFieldName(string $name, string $label): string
    {
        $candidate = Str::slug($name !== '' ? $name : $label, '_');

        return $candidate !== '' ? $candidate : 'field_'.Str::lower(Str::random(6));
    }

    private function assertCanManage(Event $event, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $event->organizer_id);

        if ($membership === null || ! in_array($membership->role, OrganizerMemberRole::managers(), true)) {
            throw EventAccessDeniedException::make();
        }
    }
}
