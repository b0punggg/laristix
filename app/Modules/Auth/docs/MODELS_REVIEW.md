<?php

namespace App\Modules\Auth\docs;

/**
 * @see ARCHITECTURE.md
 */
// Model review — User (app/Modules/Auth/Models/User.php)
//
// Implements MustVerifyEmail for Sanctum SPA + verification flow.
// platform_role: super_admin | user (platform layer).
// status: active | suspended | deleted — only active may login.
// Relations: organizerMembers, activeOrganizerMembers, eventStaffs, orders, checkIns.
// Hidden: password, remember_token.
// Uses HasApiTokens for personal access tokens (scanner apps).
// Uses HasUuid for public uuid column.
// Soft deletes enabled.
