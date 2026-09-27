// These are observed browser actions, not form results.
export function sanitizeMetaEvent(name, data = {}) {
  if (!['PageView', 'ViewContent', 'Contact', 'FindLocation', 'SocialClick', 'RegistrationFormOpen'].includes(name)) return null;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const safe = {};
  if (['group', 'institute', 'schools', 'girls', 'boys', 'platform', 'library', 'publisher'].includes(data.facility)) safe.facility = data.facility;
  if (['whatsapp', 'phone', 'telegram', 'instagram', 'facebook', 'map'].includes(data.channel)) safe.channel = data.channel;
  if (name === 'RegistrationFormOpen') {
    if (!['school-general', 'school-elite', 'institute-general', 'institute-100', 'institute-challenge'].includes(data.form_id)) return null;
    safe.form_id = data.form_id;
  }
  return { name, data: name === 'PageView' ? {} : safe, custom: ['SocialClick', 'RegistrationFormOpen'].includes(name) };
}
