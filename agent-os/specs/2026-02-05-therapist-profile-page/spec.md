# Specification: Therapist Profile Page

## Goal

Provide therapists with a dedicated profile page (`/perfil`) to view and update their personal information, professional credentials, and security settings, separate from the application settings page.

## User Stories

- As a therapist, I want to update my personal and professional information so that my details appear correctly on patient reports and the application interface.
- As a therapist, I want to change my password and manage my PIN so that I can maintain secure access to my account.

## Specific Requirements

**Database Schema Extension**

- Add 6 new optional fields to the `User` model: `phone`, `profilePhotoUrl`, `clinicName`, `licenseNumber`, `specialty`, `yearsExperience`
- Create a Prisma migration with appropriate nullable column types
- Index on `email` already exists; no additional indexes required for new fields

**Users API Module**

- Create a new `UsersModule` in NestJS with controller and service
- Implement `GET /users/me` endpoint returning full profile (exclude `passwordHash` and `pinHash`)
- Implement `PATCH /users/me` endpoint for partial profile updates using `UpdateUserDto` with `PartialType`
- Implement `PATCH /users/me/password` requiring `currentPassword` and `newPassword` fields
- All endpoints protected with JWT `AuthGuard`

**Profile Photo Upload**

- Implement `POST /users/me/photo` for multipart file upload to MinIO
- Implement `DELETE /users/me/photo` to remove existing photo
- Store photo at path `users/{userId}/profile.{ext}` in MinIO
- Return signed URL or public URL depending on bucket configuration

**Profile Page Component**

- Create `Perfil.tsx` page component at route `/perfil`
- Organize into 4 card sections: Información Personal, Información Profesional, Seguridad, Información de la Cuenta
- Follow `Ajustes.tsx` card-based layout pattern with `space-y-6` spacing
- All labels and text in Spanish

**Información Personal Section**

- Editable fields: Nombre completo (required), Correo electrónico (required), Teléfono (optional)
- Profile photo display with upload/change button using `GalleryUploadButton` pattern
- Email validation for format; phone validation for Spanish format (optional)

**Información Profesional Section**

- Editable fields: Nombre de clínica, Número de colegiado, Especialidad, Años de experiencia
- All fields optional with appropriate input types (text, text, text, number)
- No complex validation required for MVP

**Seguridad Section**

- "Cambiar contraseña" button opening inline form or modal with current password, new password, confirm password
- "Configurar PIN" button triggering existing `PinSetupModal` component
- Password change requires current password verification on backend

**Información de la Cuenta Section**

- Read-only display of: Fecha de registro (formatted date), Rol ("Terapeuta")
- No edit capability for these fields

**Form Behavior**

- Single "Guardar cambios" button at bottom of page or per-section save buttons
- Display loading state during save operation
- Show success toast on successful save; show error toast with message on failure
- Update `AuthContext` user data after successful profile update

**Navigation Integration**

- Add "Mi Perfil" link to `UserMenu` dropdown component
- Position before "Cerrar sesión" logout option

## Visual Design

No visual mockups provided. Follow existing `Ajustes.tsx` styling:

- Card containers with `bg-white dark:bg-slate-800 rounded-lg shadow-sm border`
- Section headers with `text-lg font-semibold`
- Description text with `text-sm text-slate-500`
- Consistent spacing with Tailwind utilities

## Existing Code to Leverage

**`apps/client/src/pages/Ajustes.tsx`**

- Card-based section layout pattern with consistent styling
- Use as structural template for profile page sections
- Copy container and section styling classes

**`apps/client/src/components/patients/media/GalleryUploadComponents.tsx`**

- `GalleryUploadButton` component for file selection UI
- Hidden input pattern triggered by styled button
- Adapt for single profile photo upload instead of gallery

**`apps/server/src/modules/patients/dto/update-patient.dto.ts`**

- DTO pattern using `PartialType(CreatePatientDto)` for partial updates
- Replicate pattern for `UpdateUserDto extends PartialType(CreateUserDto)`

**`apps/client/src/context/AuthProvider.tsx`**

- Current user state management via `user` and `setUser`
- Add `updateUser` method to update local state after profile save
- Sync updated user data to `localStorage`

**`apps/client/src/components/auth/PinSetupModal.tsx`**

- Existing PIN configuration modal
- Import and trigger from Seguridad section button

## Out of Scope

- Email verification when changing email address
- Two-factor authentication setup
- Multiple clinic locations per therapist
- Social login connections (Google, Facebook)
- Account deletion functionality
- GDPR data export
- Notification preferences (remains in Ajustes)
- AI/voice preferences (remains in Ajustes)
- Profile photo cropping or editing
- Password strength meter visualization
