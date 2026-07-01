# Migration Constraint Rename Report

**Target:** MySQL 8 · Laravel 10.50.2  
**Issue:** Auto-generated identifier names exceeded MySQL 64-character limit (e.g. `organizer_fee_configs_organizer_id_effective_from_effective_until_index` = 63 chars)  
**Fix:** Explicit short names on all indexes, uniques, and foreign keys (max **49** characters)

**Convention applied:**
- Indexes: `idx_<table>_<purpose>`
- Uniques: `uniq_<table>_<purpose>`
- Foreign keys: `fk_<table>_<referenced>`

**Validation:** `php artisan migrate:fresh --force` — migrations `000001`–`000044` completed successfully.

---

## Summary

| Type | Count |
|------|------:|
| Foreign keys | 118 |
| Indexes | 97 |
| Unique constraints | 38 |
| **Total named constraints** | **253** |

---

## 000001 — users

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_users_uuid` | UNIQUE | uuid |
| `uniq_users_email` | UNIQUE | email |
| `idx_users_status` | INDEX | status |

---

## 000002 — password_reset_tokens

No custom indexes/FKs (primary key on `email` only).

---

## 000003 — personal_access_tokens

| New Name | Type | Columns |
|----------|------|---------|
| `idx_pat_tokenable` | INDEX | tokenable_type, tokenable_id |
| `uniq_pat_token` | UNIQUE | token |

---

## 000004 — organizers

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_org_uuid` | UNIQUE | uuid |
| `uniq_org_slug` | UNIQUE | slug |
| `fk_org_users` | FK | approved_by → users.id |
| `idx_org_status` | INDEX | status |
| `idx_org_migr_status` | INDEX | migration_status |

---

## 000005 — organizer_members

| New Name | Type | Columns |
|----------|------|---------|
| `fk_org_mem_org` | FK | organizer_id → organizers.id |
| `fk_org_mem_users` | FK | user_id → users.id |
| `fk_org_mem_inviter` | FK | invited_by → users.id |
| `uniq_org_mem_pair` | UNIQUE | organizer_id, user_id |
| `idx_org_mem_user` | INDEX | user_id |
| `idx_org_mem_role` | INDEX | organizer_id, role |
| `idx_org_mem_user_stat` | INDEX | user_id, status |

---

## 000006 — organizer_fee_configs ⚠️ (original failure)

| New Name | Type | Columns | Replaces (auto name length) |
|----------|------|---------|----------------------------|
| `fk_org_fee_org` | FK | organizer_id → organizers.id | 40 chars |
| `fk_org_fee_users` | FK | created_by → users.id | 41 chars |
| `idx_org_fee_period` | INDEX | organizer_id, effective_from, effective_until | **63 chars** |
| `idx_org_fee_until` | INDEX | organizer_id, effective_until | **54 chars** |

---

## 000007 — platform_settings

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_plat_settings_key` | UNIQUE | key |
| `fk_plat_settings_users` | FK | updated_by → users.id |

---

## 000008 — event_categories

| New Name | Type | Columns |
|----------|------|---------|
| `fk_evt_cat_org` | FK | organizer_id → organizers.id |
| `uniq_evt_cat_slug` | UNIQUE | organizer_id, slug |
| `idx_evt_cat_active` | INDEX | is_active |

---

## 000009 — venues

| New Name | Type | Columns |
|----------|------|---------|
| `fk_venues_org` | FK | organizer_id → organizers.id |
| `idx_venues_org` | INDEX | organizer_id |
| `idx_venues_org_name` | INDEX | organizer_id, name |

---

## 000010 — events

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_events_uuid` | UNIQUE | uuid |
| `fk_events_org` | FK | organizer_id → organizers.id |
| `fk_events_venues` | FK | venue_id → venues.id |
| `fk_events_evt_cat` | FK | category_id → event_categories.id |
| `fk_events_users` | FK | created_by → users.id |
| `uniq_events_org_slug` | UNIQUE | organizer_id, slug |
| `idx_events_org_stat_start` | INDEX | organizer_id, status, start_at |
| `idx_events_stat_start` | INDEX | status, start_at |
| `idx_events_org_created` | INDEX | organizer_id, created_at |

---

## 000011 — event_schedules

| New Name | Type | Columns |
|----------|------|---------|
| `fk_evt_sched_events` | FK | event_id → events.id |
| `fk_evt_sched_org` | FK | organizer_id → organizers.id |
| `idx_evt_sched_sort` | INDEX | event_id, sort_order |
| `idx_evt_sched_org` | INDEX | organizer_id |

---

## 000012 — event_media

| New Name | Type | Columns |
|----------|------|---------|
| `fk_evt_media_events` | FK | event_id → events.id |
| `fk_evt_media_org` | FK | organizer_id → organizers.id |
| `idx_evt_media_sort` | INDEX | event_id, sort_order |
| `idx_evt_media_org` | INDEX | organizer_id |

---

## 000013 — event_sessions

| New Name | Type | Columns |
|----------|------|---------|
| `fk_evt_sess_events` | FK | event_id → events.id |
| `fk_evt_sess_org` | FK | organizer_id → organizers.id |
| `fk_evt_sess_sched` | FK | schedule_id → event_schedules.id |
| `fk_evt_sess_venues` | FK | venue_id → venues.id |
| `idx_evt_sess_start` | INDEX | event_id, start_at |
| `idx_evt_sess_org` | INDEX | organizer_id |
| `idx_evt_sess_sched` | INDEX | schedule_id |

---

## 000014 — registration_forms

| New Name | Type | Columns |
|----------|------|---------|
| `fk_reg_forms_events` | FK | event_id → events.id |
| `fk_reg_forms_org` | FK | organizer_id → organizers.id |
| `uniq_reg_forms_event` | UNIQUE | event_id |
| `idx_reg_forms_org` | INDEX | organizer_id |

---

## 000015 — form_fields

| New Name | Type | Columns |
|----------|------|---------|
| `fk_form_fld_forms` | FK | form_id → registration_forms.id |
| `fk_form_fld_org` | FK | organizer_id → organizers.id |
| `uniq_form_fld_name` | UNIQUE | form_id, name |
| `idx_form_fld_sort` | INDEX | form_id, sort_order |
| `idx_form_fld_org` | INDEX | organizer_id |

---

## 000016 — form_field_options

| New Name | Type | Columns |
|----------|------|---------|
| `fk_form_opt_fld` | FK | field_id → form_fields.id |
| `fk_form_opt_org` | FK | organizer_id → organizers.id |
| `idx_form_opt_sort` | INDEX | field_id, sort_order |
| `idx_form_opt_org` | INDEX | organizer_id |

---

## 000017 — ticket_types

| New Name | Type | Columns |
|----------|------|---------|
| `fk_tkt_types_events` | FK | event_id → events.id |
| `fk_tkt_types_org` | FK | organizer_id → organizers.id |
| `idx_tkt_types_evt_stat` | INDEX | event_id, status, sort_order |
| `idx_tkt_types_org` | INDEX | organizer_id |
| `idx_tkt_types_sales` | INDEX | event_id, sales_start_at, sales_end_at |
| `idx_tkt_types_pkg` | INDEX | organizer_id, package_type |

---

## 000018 — promo_codes

| New Name | Type | Columns |
|----------|------|---------|
| `fk_promo_codes_org` | FK | organizer_id → organizers.id |
| `fk_promo_codes_events` | FK | event_id → events.id |
| `uniq_promo_codes_code` | UNIQUE | organizer_id, code |
| `idx_promo_codes_event` | INDEX | event_id |
| `idx_promo_codes_active` | INDEX | organizer_id, is_active |

---

## 000019 — coupons

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_coupons_code` | UNIQUE | code |
| `fk_coupons_org` | FK | organizer_id → organizers.id |
| `fk_coupons_events` | FK | event_id → events.id |
| `fk_coupons_users` | FK | created_by → users.id |
| `idx_coupons_org_active` | INDEX | organizer_id, is_active |
| `idx_coupons_event` | INDEX | event_id |
| `idx_coupons_scope` | INDEX | scope, is_active |

---

## 000020 — referral_codes

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_ref_codes_code` | UNIQUE | code |
| `fk_ref_codes_org` | FK | organizer_id → organizers.id |
| `fk_ref_codes_users` | FK | user_id → users.id |
| `fk_ref_codes_events` | FK | event_id → events.id |
| `idx_ref_codes_active` | INDEX | organizer_id, is_active |
| `idx_ref_codes_event` | INDEX | event_id |
| `idx_ref_codes_user` | INDEX | user_id |

---

## 000021 — orders

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_orders_uuid` | UNIQUE | uuid |
| `uniq_orders_number` | UNIQUE | order_number |
| `uniq_orders_idem` | UNIQUE | idempotency_key |
| `fk_orders_org` | FK | organizer_id → organizers.id |
| `fk_orders_events` | FK | event_id → events.id |
| `fk_orders_users` | FK | user_id → users.id |
| `fk_orders_promo` | FK | promo_code_id → promo_codes.id |
| `fk_orders_coupons` | FK | coupon_id → coupons.id |
| `fk_orders_ref_code` | FK | referral_code_id → referral_codes.id |
| `idx_orders_org_stat` | INDEX | organizer_id, status, created_at |
| `idx_orders_event_stat` | INDEX | event_id, status |
| `idx_orders_buyer_email` | INDEX | buyer_email |
| `idx_orders_stat_exp` | INDEX | status, expires_at |
| `idx_orders_user_created` | INDEX | user_id, created_at |
| `idx_orders_org_evt` | INDEX | organizer_id, event_id, created_at |

---

## 000022 — order_items

| New Name | Type | Columns |
|----------|------|---------|
| `fk_order_items_orders` | FK | order_id → orders.id |
| `fk_order_items_org` | FK | organizer_id → organizers.id |
| `fk_order_items_events` | FK | event_id → events.id |
| `fk_order_items_tkt` | FK | ticket_type_id → ticket_types.id |
| `idx_order_items_order` | INDEX | order_id |
| `idx_order_items_tkt` | INDEX | ticket_type_id |
| `idx_order_items_org_evt` | INDEX | organizer_id, event_id |

---

## 000023 — promo_code_usages

| New Name | Type | Columns |
|----------|------|---------|
| `fk_promo_usage_promo` | FK | promo_code_id → promo_codes.id |
| `fk_promo_usage_orders` | FK | order_id → orders.id |
| `fk_promo_usage_org` | FK | organizer_id → organizers.id |
| `uniq_promo_usage_order` | UNIQUE | order_id |
| `idx_promo_usage_promo` | INDEX | promo_code_id |
| `idx_promo_usage_org` | INDEX | organizer_id |

---

## 000024 — coupon_usages

| New Name | Type | Columns |
|----------|------|---------|
| `fk_coupon_usage_coupon` | FK | coupon_id → coupons.id |
| `fk_coupon_usage_orders` | FK | order_id → orders.id |
| `fk_coupon_usage_org` | FK | organizer_id → organizers.id |
| `fk_coupon_usage_users` | FK | user_id → users.id |
| `uniq_coupon_usage_pair` | UNIQUE | coupon_id, order_id |
| `idx_coupon_usage_coupon` | INDEX | coupon_id |
| `idx_coupon_usage_user` | INDEX | user_id, coupon_id |
| `idx_coupon_usage_org` | INDEX | organizer_id |

---

## 000025 — registration_groups

| New Name | Type | Columns |
|----------|------|---------|
| `fk_reg_groups_org` | FK | organizer_id → organizers.id |
| `fk_reg_groups_events` | FK | event_id → events.id |
| `fk_reg_groups_orders` | FK | order_id → orders.id |
| `fk_reg_groups_items` | FK | order_item_id → order_items.id |
| `idx_reg_groups_order` | INDEX | order_id, status |
| `idx_reg_groups_org_evt` | INDEX | organizer_id, event_id |
| `idx_reg_groups_item` | INDEX | order_item_id |

---

## 000026 — registrations

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_regs_uuid` | UNIQUE | uuid |
| `fk_regs_org` | FK | organizer_id → organizers.id |
| `fk_regs_events` | FK | event_id → events.id |
| `fk_regs_orders` | FK | order_id → orders.id |
| `fk_regs_items` | FK | order_item_id → order_items.id |
| `fk_regs_groups` | FK | registration_group_id → registration_groups.id |
| `fk_regs_tkt` | FK | ticket_type_id → ticket_types.id |
| `uniq_regs_item_seat` | UNIQUE | order_item_id, seat_index |
| `idx_regs_event_stat` | INDEX | event_id, status |
| `idx_regs_org_evt` | INDEX | organizer_id, event_id, created_at |
| `idx_regs_order` | INDEX | order_id |
| `idx_regs_evt_email` | INDEX | event_id, attendee_email |
| `idx_regs_email` | INDEX | attendee_email |
| `idx_regs_group` | INDEX | registration_group_id |

---

## 000027 — registration_answers

| New Name | Type | Columns |
|----------|------|---------|
| `fk_reg_ans_regs` | FK | registration_id → registrations.id |
| `fk_reg_ans_fld` | FK | form_field_id → form_fields.id |
| `fk_reg_ans_org` | FK | organizer_id → organizers.id |
| `fk_reg_ans_events` | FK | event_id → events.id |
| `uniq_reg_ans_pair` | UNIQUE | registration_id, form_field_id |
| `idx_reg_ans_evt_fld` | INDEX | event_id, form_field_id |
| `idx_reg_ans_org_evt` | INDEX | organizer_id, event_id |
| `idx_reg_ans_fld` | INDEX | form_field_id |

---

## 000028 — tickets

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_tickets_uuid` | UNIQUE | uuid |
| `uniq_tickets_reg` | UNIQUE | registration_id |
| `uniq_tickets_code` | UNIQUE | ticket_code |
| `uniq_tickets_qr_hash` | UNIQUE | qr_token_hash |
| `fk_tickets_regs` | FK | registration_id → registrations.id |
| `fk_tickets_org` | FK | organizer_id → organizers.id |
| `fk_tickets_events` | FK | event_id → events.id |
| `fk_tickets_tkt` | FK | ticket_type_id → ticket_types.id |
| `idx_tickets_event_stat` | INDEX | event_id, status |
| `idx_tickets_org_evt` | INDEX | organizer_id, event_id |

---

## 000029 — payments

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_payments_uuid` | UNIQUE | uuid |
| `uniq_payments_gateway_tx` | UNIQUE | gateway, gateway_transaction_id |
| `fk_payments_orders` | FK | order_id → orders.id |
| `fk_payments_org` | FK | organizer_id → organizers.id |
| `idx_payments_order` | INDEX | order_id |
| `idx_payments_org_stat` | INDEX | organizer_id, status, created_at |
| `idx_payments_stat` | INDEX | status, created_at |

---

## 000030 — payment_logs

| New Name | Type | Columns |
|----------|------|---------|
| `fk_pay_logs_payments` | FK | payment_id → payments.id |
| `fk_pay_logs_orders` | FK | order_id → orders.id |
| `fk_pay_logs_org` | FK | organizer_id → organizers.id |
| `uniq_pay_logs_gateway_evt` | UNIQUE | gateway, gateway_event_id |
| `idx_pay_logs_payment` | INDEX | payment_id, created_at |
| `idx_pay_logs_order` | INDEX | order_id, created_at |
| `idx_pay_logs_processed` | INDEX | processed, created_at |
| `idx_pay_logs_org` | INDEX | organizer_id |

---

## 000031 — refunds

| New Name | Type | Columns |
|----------|------|---------|
| `fk_refunds_payments` | FK | payment_id → payments.id |
| `fk_refunds_orders` | FK | order_id → orders.id |
| `fk_refunds_org` | FK | organizer_id → organizers.id |
| `fk_refunds_users` | FK | initiated_by → users.id |
| `idx_refunds_payment` | INDEX | payment_id |
| `idx_refunds_order` | INDEX | order_id |
| `idx_refunds_org_stat` | INDEX | organizer_id, status |

---

## 000032 — waitlists

| New Name | Type | Columns |
|----------|------|---------|
| `fk_waitlists_org` | FK | organizer_id → organizers.id |
| `fk_waitlists_events` | FK | event_id → events.id |
| `fk_waitlists_tkt` | FK | ticket_type_id → ticket_types.id |
| `fk_waitlists_sess` | FK | session_id → event_sessions.id |
| `fk_waitlists_users` | FK | user_id → users.id |
| `fk_waitlists_orders` | FK | converted_order_id → orders.id |
| `idx_waitlists_evt_stat` | INDEX | event_id, status, created_at |
| `idx_waitlists_tkt_stat` | INDEX | ticket_type_id, status |
| `idx_waitlists_org_stat` | INDEX | organizer_id, status |
| `idx_waitlists_lookup` | INDEX | event_id, email, ticket_type_id, status |

---

## 000033 — referrals

| New Name | Type | Columns |
|----------|------|---------|
| `fk_referrals_ref_code` | FK | referral_code_id → referral_codes.id |
| `fk_referrals_org` | FK | organizer_id → organizers.id |
| `fk_referrals_events` | FK | event_id → events.id |
| `fk_referrals_orders` | FK | order_id → orders.id |
| `fk_referrals_users` | FK | referred_user_id → users.id |
| `uniq_referrals_order` | UNIQUE | order_id |
| `idx_referrals_code_stat` | INDEX | referral_code_id, status |
| `idx_referrals_evt_stat` | INDEX | event_id, status |
| `idx_referrals_org_stat` | INDEX | organizer_id, status |

---

## 000034 — check_in_gates

| New Name | Type | Columns |
|----------|------|---------|
| `fk_chk_gates_events` | FK | event_id → events.id |
| `fk_chk_gates_org` | FK | organizer_id → organizers.id |
| `uniq_chk_gates_code` | UNIQUE | event_id, code |
| `idx_chk_gates_org` | INDEX | organizer_id |

---

## 000035 — check_ins

| New Name | Type | Columns |
|----------|------|---------|
| `fk_chk_ins_tickets` | FK | ticket_id → tickets.id |
| `fk_chk_ins_regs` | FK | registration_id → registrations.id |
| `fk_chk_ins_events` | FK | event_id → events.id |
| `fk_chk_ins_org` | FK | organizer_id → organizers.id |
| `fk_chk_ins_gates` | FK | gate_id → check_in_gates.id |
| `fk_chk_ins_users` | FK | scanned_by → users.id |
| `idx_chk_ins_ticket` | INDEX | ticket_id, checked_in_at |
| `idx_chk_ins_event` | INDEX | event_id, checked_in_at |
| `idx_chk_ins_org_evt` | INDEX | organizer_id, event_id, checked_in_at |
| `idx_chk_ins_scanner` | INDEX | scanned_by, checked_in_at |
| `idx_chk_ins_reg` | INDEX | registration_id |

---

## 000036 — activity_logs

| New Name | Type | Columns |
|----------|------|---------|
| `fk_act_logs_org` | FK | organizer_id → organizers.id |
| `fk_act_logs_users` | FK | user_id → users.id |
| `idx_act_logs_org` | INDEX | organizer_id, created_at |
| `idx_act_logs_subject` | INDEX | subject_type, subject_id |
| `idx_act_logs_user` | INDEX | user_id, created_at |
| `idx_act_logs_action` | INDEX | action, created_at |

---

## 000037 — audit_logs

| New Name | Type | Columns |
|----------|------|---------|
| `fk_audit_logs_org` | FK | organizer_id → organizers.id |
| `fk_audit_logs_users` | FK | user_id → users.id |
| `idx_audit_logs_org_cat` | INDEX | organizer_id, category, created_at |
| `idx_audit_logs_auditable` | INDEX | auditable_type, auditable_id |
| `idx_audit_logs_event` | INDEX | event, created_at |
| `idx_audit_logs_request` | INDEX | request_id |

---

## 000038 — notification_logs

| New Name | Type | Columns |
|----------|------|---------|
| `fk_notif_logs_org` | FK | organizer_id → organizers.id |
| `idx_notif_logs_notifiable` | INDEX | notifiable_type, notifiable_id |
| `idx_notif_logs_recipient` | INDEX | recipient_email, created_at |
| `idx_notif_logs_stat` | INDEX | status, created_at |
| `idx_notif_logs_org` | INDEX | organizer_id |

---

## 000039 — daily_event_stats

| New Name | Type | Columns |
|----------|------|---------|
| `fk_daily_evt_events` | FK | event_id → events.id |
| `fk_daily_evt_org` | FK | organizer_id → organizers.id |
| `uniq_daily_evt_date` | UNIQUE | event_id, stat_date |
| `idx_daily_evt_org_date` | INDEX | organizer_id, stat_date |

---

## 000040 — daily_organizer_stats

| New Name | Type | Columns |
|----------|------|---------|
| `fk_daily_org_org` | FK | organizer_id → organizers.id |
| `uniq_daily_org_date` | UNIQUE | organizer_id, stat_date |

---

## 000041 — event_staffs

| New Name | Type | Columns |
|----------|------|---------|
| `fk_evt_staff_events` | FK | event_id → events.id |
| `fk_evt_staff_org` | FK | organizer_id → organizers.id |
| `fk_evt_staff_users` | FK | user_id → users.id |
| `fk_evt_staff_mem` | FK | organizer_member_id → organizer_members.id |
| `fk_evt_staff_assigner` | FK | assigned_by → users.id |
| `uniq_evt_staff_pair` | UNIQUE | event_id, user_id |
| `idx_evt_staff_org_evt` | INDEX | organizer_id, event_id, status |
| `idx_evt_staff_user` | INDEX | user_id, status |
| `idx_evt_staff_role` | INDEX | event_id, role, status |

---

## 000042 — tickets (alter)

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_tickets_qr_token` | UNIQUE | qr_token |
| `idx_tickets_checked_in` | INDEX | checked_in_at |

---

## 000043 — notification_templates

| New Name | Type | Columns |
|----------|------|---------|
| `fk_notif_tpl_org` | FK | organizer_id → organizers.id |
| `fk_notif_tpl_events` | FK | event_id → events.id |
| `fk_notif_tpl_users` | FK | created_by → users.id |
| `uniq_notif_tpl_scope` | UNIQUE | organizer_id, event_id, channel, slug |
| `idx_notif_tpl_channel` | INDEX | channel, is_active |
| `idx_notif_tpl_org` | INDEX | organizer_id, is_active |

---

## 000044 — notification_jobs

| New Name | Type | Columns |
|----------|------|---------|
| `uniq_notif_jobs_uuid` | UNIQUE | uuid |
| `fk_notif_jobs_org` | FK | organizer_id → organizers.id |
| `fk_notif_jobs_tpl` | FK | notification_template_id → notification_templates.id |
| `fk_notif_jobs_log` | FK | notification_log_id → notification_logs.id |
| `idx_notif_jobs_notifiable` | INDEX | notifiable_type, notifiable_id |
| `idx_notif_jobs_stat_sched` | INDEX | status, scheduled_at |
| `idx_notif_jobs_org_stat` | INDEX | organizer_id, status, created_at |
| `idx_notif_jobs_channel` | INDEX | channel, status |
| `idx_notif_jobs_corr` | INDEX | correlation_id |

---

## Longest Names (all under 50 chars)

| Name | Length |
|------|-------:|
| `idx_notif_jobs_org_stat` | 23 |
| `idx_orders_org_stat` | 19 |
| `fk_notif_jobs_tpl` | 17 |
| `uniq_notif_tpl_scope` | 20 |

**Maximum name length in this set: 23 characters** (well under MySQL 64 / project 50 limit).

---

## Note: Sanctum Duplicate Migration

After `000044`, Laravel Sanctum may still attempt `2019_12_14_000001_create_personal_access_tokens_table`. Add to `AppServiceProvider::register()`:

```php
\Laravel\Sanctum\Sanctum::ignoreMigrations();
```

This is separate from the identifier-length fix.
