# Secure Upload Design

Required checks for production:

- maximum size;
- extension allow-list;
- MIME/content inspection;
- hash on receipt;
- tenant-scoped storage path;
- private bucket;
- short-lived signed URLs;
- malware scanner adapter/quarantine;
- no executable file types;
- no direct inline rendering of untrusted content unless sanitized;
- retention/deletion job.

The current demo does not accept an actual file upload from the public page; that boundary is deliberately not represented as secure before a production storage/scanning implementation is deployed and tested.
