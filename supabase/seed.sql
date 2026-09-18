-- Deterministic demo seed for an operator who wants sample rows in Supabase.
-- IDs are UUIDs generated from fixed values; replace with fresh UUIDs for isolated environments as appropriate.
insert into public.obligation_templates(code,name,category,jurisdiction,issuer,authority_url,applicability_note,reminder_days,effective_from)
values
('GENERIC_INSURANCE','Insurance certificate renewal','INSURANCE','Lagos, NG','Configured insurer','https://example.invalid/authority','Use only after confirming actual applicability.',ARRAY[90,60,30,14,7,3,0,-1],now()),
('GENERIC_DIGITAL_ASSET','Domain/subscription renewal','DIGITAL_ASSET','N/A','Registrar/vendor',null,'Merchant-controlled renewal.',ARRAY[60,30,14,7,0],now())
on conflict(code) do nothing;
