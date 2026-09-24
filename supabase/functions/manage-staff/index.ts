// Supabase Edge Function: create / delete technician accounts.
// Only callers who are admins in public.staff may use it.
// Deploy: supabase functions deploy manage-staff
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ROLES = ['CAD/CAM Designer', 'Ceramist', '3D Printing Tech'];

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { auth: { persistSession: false } },
    );

    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { data: me } = await admin.from('staff').select('is_admin').eq('id', user.id).maybeSingle();
    if (!me?.is_admin) return json({ error: 'Forbidden' }, 403);

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return json({ error: 'Invalid JSON' }, 400);
    }

    if (body.action === 'create') {
        const name = String(body.name ?? '').trim();
        const email = String(body.email ?? '').trim().toLowerCase();
        const password = String(body.password ?? '');
        const role = ROLES.includes(String(body.role)) ? String(body.role) : ROLES[0];

        if (!name || name.length > 120) return json({ error: 'Invalid name' }, 400);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email' }, 400);
        if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

        const { data: created, error } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (error || !created.user) return json({ error: error?.message ?? 'Could not create user' }, 400);

        const { error: insertError } = await admin.from('staff').insert({
            id: created.user.id,
            name,
            email,
            role,
            is_admin: false,
        });
        if (insertError) {
            await admin.auth.admin.deleteUser(created.user.id);
            return json({ error: insertError.message }, 400);
        }
        return json({ ok: true });
    }

    if (body.action === 'delete') {
        const id = String(body.id ?? '');
        if (!id) return json({ error: 'Missing id' }, 400);
        if (id === user.id) return json({ error: 'You cannot delete your own account' }, 400);

        // Deleting the auth user cascades to public.staff.
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
});
