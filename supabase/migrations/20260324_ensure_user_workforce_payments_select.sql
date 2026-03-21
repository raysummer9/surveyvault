-- Ensure members can always read their own workforce_payments rows (hydration + pending-review page).
-- Admin policies from later migrations are additive (PERMISSIVE OR); this re-applies the user policy by name.
drop policy if exists "Users can select own workforce payments" on public.workforce_payments;
create policy "Users can select own workforce payments"
on public.workforce_payments for select
using (auth.uid() = user_id);
