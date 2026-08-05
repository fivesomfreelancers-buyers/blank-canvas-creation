CREATE OR REPLACE FUNCTION public.content_is_disallowed(_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $fn$
DECLARE
  _norm text;
  _w text;
  _suffix text := '(s|es|ing|ed|er|ers|ka|ga|ta|da|aha|aa|yahay|yahow|yaha|nimo|yo|yin|yinka|ooyin|ooyinka)?';
  -- Latin roots: unambiguous profanity / hate speech / explicit sexual terms only.
  _bad text[] := ARRAY[
    -- English profanity & slurs
    'fuck','fucker','motherfucker','fuk','fck','shit','bullshit','bitch','asshole','arsehole',
    'dickhead','cock','cocksucker','pussy','cunt','twat','wanker','whore','slut','hooker',
    'nigger','nigga','faggot','retard','bastard','stfu',
    -- English explicit sexual
    'porn','porno','pornography','pornhub','xxx','nude','nudity','sexting','sexchat','cybersex',
    'blowjob','handjob','rimjob','creampie','orgasm','masturbate','masturbation','horny','boner',
    'onlyfans','camgirl','camsex','rape','rapist','molest','molester','pedophile','paedophile','pedo',
    -- Somali insults / sexual (everyday words like was, sug, kac, gus, qashin, gaal excluded)
    'hooyada','hoyada','hooyadaa','hoyadaa','hooyadeen','waasay','wasay','kuwaso','kuwas','iswaas',
    'iskuwaas','lawaasay','siil','siilka','siilo','kintir','guuska','guuskaaga','gusaaga',
    'dhilo','dhillo','sharmuto','sharmuuto','sharmuutada','garac','naayaa','naaya','nayaa',
    'doqon','nacas','dameer','bahal','xayawaan','orgi','futada','futo','kacsan','kacsi',
    'nijaas','khaniis','khanis','shaydaan','foolxun','qashinyahay','waalan',
    -- French insults
    'putain','pute','salope','connard','connasse','enculer','encule','enfoire','batard','nique','niquer','merde'
  ];
  _arabic text[] := ARRAY[
    'كسمك','كسختك','كسامك','شرموطة','شرموط','قحبة','قحبه','عرص','عرصات',
    'منيك','منيوك','منياك','طيزك','نياك','كلبة'
  ];
BEGIN
  IF _text IS NULL OR btrim(_text) = '' THEN
    RETURN false;
  END IF;

  -- Arabic: bounded match (not inside a longer Arabic word)
  FOREACH _w IN ARRAY _arabic LOOP
    IF _text ~ ('(^|[^ء-ي])' || _w || '([^ء-ي]|$)') THEN
      RETURN true;
    END IF;
  END LOOP;

  -- Latin: normalize leet-speak per character, turn separators into spaces
  -- (never glue words together), collapse long repeats.
  _norm := lower(_text);
  _norm := translate(_norm, '01!|34@5$789+', 'oiiieaassbgt');
  _norm := regexp_replace(_norm, '[^a-z]+', ' ', 'g');
  _norm := regexp_replace(_norm, '(.)\1{2,}', '\1\1', 'g');
  _norm := ' ' || btrim(_norm) || ' ';

  -- Whole-word matching only (root, optionally followed by a known suffix).
  FOREACH _w IN ARRAY _bad LOOP
    IF length(_w) >= 3 AND _norm ~ ('\m' || _w || _suffix || '\M') THEN
      RETURN true;
    END IF;
  END LOOP;

  -- Explicit multi-word phrases
  IF _norm ~ '\m(aabo waas|qaba siil|islaan xun|kill you|send nudes|naked (photo|pic|picture)|sexual favou?r)\M' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$fn$;