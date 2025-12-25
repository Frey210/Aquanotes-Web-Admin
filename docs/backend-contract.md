# Backend Contract Summary

Base URL: `/`
OpenAPI: `/openapi.json` (FastAPI default)
Docs UI: `/docs`
Auth:
- Bearer token stored in `auth_tokens` table.
- Send `Authorization: Bearer <token>` for protected endpoints.
- Admin device provisioning uses `X-API-Key: <ADMIN_API_KEY>`.
- First registered user is promoted to `admin` role (RBAC bootstrap).
- Admin accounts do not create tambak/kolam/devices; use admin endpoints for global monitoring.

## Users
- `POST /users/register` -> `UserResponse`
  - Body: `name`, `email`, `password`
- `POST /users/login` -> `{ access_token, token_type }`
  - Body: `email`, `password`
- `POST /users/logout` (auth) -> `{ message, success }`
- `GET /users/me` (auth) -> `UserResponse`
- `PUT /users/profile` (auth) -> `UserResponse`
  - Body: `name`, `old_password`, `new_password`, `notification_cooldown_minutes`
- `POST /users/fcm-token` (auth)
- `DELETE /users/fcm-token` (auth)
- `GET /users` (admin) -> `UserResponse[]`
  - Query: `skip`, `limit`, `search`, `role`, `sort_by`, `sort_dir`
  - Response header: `X-Total-Count`
- `GET /users/{user_id}` (admin) -> `UserResponse`
- `POST /users` (admin) -> `UserResponse`
  - Body: `name`, `email`, `password`, `role`
- `PUT /users/{user_id}` (admin) -> `UserResponse`
  - Body: `name?`, `email?`, `password?`, `role?`, `notification_cooldown_minutes?`
- `DELETE /users/{user_id}` (admin) -> 204

## Admin (API Key)
- `POST /admin/devices` (X-API-Key) -> `DeviceResponse`
  - Body: `uid`
- `GET /admin/devices` (X-API-Key) -> `AdminDeviceResponse[]`

## Admin (Role = admin)
- `GET /admin/overview` -> `AdminOverview`
- `GET /admin/devices/all` -> `AdminDeviceResponse[]`
- `PUT /admin/devices/{device_id}/status` -> `AdminDeviceResponse`
  - Body: `status` (online/offline/maintenance)
- `PUT /admin/devices/{device_id}/activate` -> `AdminDeviceResponse`
- `PUT /admin/devices/{device_id}/deactivate` -> `AdminDeviceResponse`
- `PUT /admin/devices/{device_id}/schedule` -> `AdminDeviceResponse`
  - Body: `deactivate_at` (datetime UTC, null untuk reset)
- `GET /admin/sensor?uid=<uid>` -> `SensorDataResponse[]`
  - Query: `start_date`, `end_date`, `skip`, `limit`, `sort_dir`
  - Response header: `X-Total-Count`

## Devices
- `POST /devices` (auth) -> `DeviceResponse`
  - Body: `uid`, `name`
- `GET /devices` (auth) -> `DeviceResponse[]`
- `DELETE /devices/{device_uid}` (auth)
- `PUT /devices/{device_id}` (auth) -> `DeviceResponse`
  - Body: `name?`, `connection_interval?`
- `POST /devices/{device_id}/move` (auth) -> `KolamResponse`
  - Body: `target_kolam_id`
- `GET /devices/status/` (auth) -> `{ online, offline, maintenance, devices[] }`
- `PUT /devices/{device_id}/maintenance` (auth) -> 204
- `PUT /devices/{device_id}/online` (auth) -> 204
- `PUT /devices/{device_id}/interval?interval=<minutes>` (auth) -> 204

## Device Thresholds
- `PUT /devices/{device_id}/thresholds` (auth) -> `DeviceThresholdResponse`
- `GET /devices/{device_id}/thresholds` (auth) -> `DeviceThresholdResponse`
- `DELETE /devices/{device_id}/thresholds` (auth) -> 204

## Tambak (Farm)
- `POST /tambak` (auth) -> `TambakResponse`
- `GET /tambak` (auth) -> `TambakResponse[]`
- `PUT /tambak/{tambak_id}` (auth) -> `TambakResponse`
- `DELETE /tambak/{tambak_id}` (auth)

## Kolam (Pond)
- `POST /kolam` (auth) -> `KolamResponse`
- `GET /kolam?tambak_id=<id>` (auth) -> `KolamResponse[]`
- `PUT /kolam/{kolam_id}` (auth) -> `KolamResponse`
- `DELETE /kolam/{kolam_id}` (auth)

## Sensor Data
- `POST /sensor` -> `SensorDataResponse`
  - Body: `uid`, `suhu`, `ph`, `do`, `tds`, `ammonia`, `salinitas`, `timestamp`
- `GET /sensor?uid=<uid>` (auth) -> `SensorDataResponse[]`
  - Query: `start_date`, `end_date`, `skip`, `limit`, `sort_dir`
  - Response header: `X-Total-Count`

## Monitoring
- `GET /monitoring?last_n=<int>` (auth) -> `MonitoringResponse`

## Export
- `POST /export/csv` -> CSV download
  - Body: `device_id`, `start_date`, `end_date`

## Notifications
- `GET /notifications?days=<int>&unread_only=<bool>&skip=<int>&limit=<int>` (auth) -> `NotificationResponse[]`
- `PUT /notifications/{notification_id}/read` (auth) -> 204
- `PUT /notifications/read-all` (auth) -> 204
- `GET /notifications/unread-count` (auth) -> `int`

## Key Schemas
- `UserResponse`: `id`, `name`, `email`, `role`, `created_at`, `fcm_token`, `notification_cooldown_minutes`
- `DeviceResponse`: `id`, `uid`, `name`, `user_id`, `is_active`, `deactivate_at`, `status`, `last_seen`, `connection_interval`
- `TambakResponse`: `id`, `name`, `country`, `province`, `city`, `district`, `village`, `address`, `cultivation_type`
- `KolamResponse`: `id`, `nama`, `komoditas`
- `SensorDataResponse`: `id`, `device_id`, `timestamp`, `suhu`, `ph`, `do`, `tds`, `ammonia`, `salinitas`
- `DeviceThresholdResponse`: `device_id`, `device_name`, `temp_min`, `temp_max`, `ph_min`, `ph_max`, `do_min`, `tds_max`, `ammonia_max`, `salinitas_min`, `salinitas_max`
- `NotificationResponse`: `id`, `device_id`, `device_name`, `message`, `parameter`, `threshold_value`, `current_value`, `is_read`, `timestamp`, `fcm_sent`
- `AdminDeviceResponse`: `id`, `uid`, `name`, `user_id`, `user_name`, `registered`, `status`, `last_seen`, `is_active`, `deactivate_at`
- `AdminOverview`: `total_users`, `total_devices`, `total_tambak`, `total_kolam`, `total_notifications`, `online_devices`, `offline_devices`, `maintenance_devices`, `inactive_devices`, `database_ok`
