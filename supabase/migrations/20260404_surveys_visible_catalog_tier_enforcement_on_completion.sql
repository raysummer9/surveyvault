-- Show full active survey catalog to every member; tier eligibility is enforced on completions (existing policy).
drop policy if exists "Members read surveys for their payment tier" on public.surveys;

create policy "Members read active surveys catalog"
on public.surveys for select
to authenticated
using (is_active = true);
