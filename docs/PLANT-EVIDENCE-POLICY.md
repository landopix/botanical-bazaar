# Plant evidence and listing workflow

Sanity owns shared botanical facts through `plantReference`; `productPlantLink` associates a Shopify product ID and handle with one taxon and optional cultivar. Shopify continues to own price, stock, variants, specimen measurements, images, nursery treatment history and availability. Do not create a second plant research database in Shopify. Existing `plantCareSheet` content is not overwritten. The initial public dataset query on 2026-09-12 returned zero care sheets.

## Research protocol

Read the source itself. Search snippets, AI summaries, old listing copy, tags and image alt text are discovery aids, never independent evidence. Record exact URL, title, publisher, revision date if shown, access date, section/page locator, applicability, evidence type, limitations and reuse basis. Prefer original factual summaries; store section locators rather than copied passages. Read linked assessments when conclusions need interpretation. Do not copy articles, images or datasets without checking the applicable license, including attribution and commercial-use restrictions. Do not presume an API or bulk-ingestion permission.

Use Kew POWO for accepted names, synonyms, family and native distribution. Use horticultural or registration authorities for cultivars and hybrids. Keep trade names and identification uncertainty explicit. Use species-specific extension, RHS, UF/IFAS and specialist orchid sources for care. Genus advice must say genus-level in both scope and reader-facing text. Do not infer exact humidity, feeding frequency, watering depth, temperature, yield or processing parameters. Use substrate condition and growth stage for watering. Distinguish indoor/container size from outdoor potential, and hardiness zones from comfortable indoor temperatures.

Use ASPCA for the animals it explicitly assesses, and poison centers, veterinary references and universities for applicable safety. Unknown is not non-toxic. Never generalize between humans, cats, dogs or other animals. Include plant part and exposure route; treat sap, spines and ingestion separately. Use precise attribution, not “safe for pets/children.” One directly applicable authoritative source may support an ordinary claim. Consequential safety, edibility, medicinal and processing claims require corroboration and recorded safety review. Sources that repeat one original reference share an `originGroup`; different domains alone do not establish independence.

Use UF/IFAS Assessment and CABI for ecological risk, and current agriculture authorities for legal restrictions. Keep jurisdiction, assessment date, cultivation recommendation and legal restriction distinct. Absence from a list is not universal clearance. Recheck the actual sale/shipping destination at order time; a website safety badge is not a compliance engine.

Keep each use separate: culinary, agriculture, traditional medicine, laboratory study, animal study, human study, clinical assessment, fiber, dye, fragrance, oil or other documented use. NCCIH and EMA are preferred clinical assessments. Read the original study or assessment and identify preparation, dose studied, population and limitations; inclusion in a database is not endorsement. PROTA/PFAF are useful discovery resources, not standalone authorization for safety-sensitive instructions. Historical use is not a proven treatment. Never turn a standardized preparation into homemade tea, extract, essential-oil or dosage instructions.

Before actionable processing, require an exact applicable published government/university method and safety review: species, part, maturity, intended output, equipment, critical conditions, storage and hazards. Leave unsupported fields empty. No actionable methods are approved in this pilot. Species-level edibility does not establish that nursery inventory is suitable for consumption; require verified treatment history and intended food use.

Preserve disagreements as separate scoped claims. Investigate taxonomy, environment, preparation, date and geography; do not average incompatible numbers. Flag unresolved conflicts. Rarity, conservation, air purification, medicinal benefit and edibility are substantive claims requiring evidence. Source facts, editorial recommendations and nursery observations are different `kind` values. Never relabel an AI inference as a nursery observation.

## Review and release

States: unverified, supported, conflicting, approved, needs recheck. Supported means the cited material supports the scoped claim; approved additionally requires reviewer/date/recheck date and all policy conditions. “Codex source review” records who performed this pilot review; it does not imply owner, clinician or regulatory approval. Record-level status remains supported until release blockers are resolved. Harmless missing optional fields can remain absent; missing safety review or unsupported actionable instructions block automated generation.

Run `node --test tests/plant-reference.test.mjs`. Retrieve a fresh Sanity export containing the approved record and exact approved product link before generation, then run `node bin/plant-listing.mjs reviewed-bundle.json exact-product-handle`. A nonzero exit and `ready:false` require research/review. Do not bypass this by writing from tags, fallback values or a different species. The output only includes claim IDs, category, text and citations; it cannot alter inventory. Cultivar claims are filtered against the approved link.

Re-read the Shopify product immediately before preparing any external change. Compare original and proposed text, preserve specimen disclosures, and change only explicitly approved fields. Never write price, inventory, variants, SKU, images, pot size or treatment history from the plant reference. If the product changed since the audit, stop the mutation and rebase the proposal on fresh data. New listings remain drafts. Active listing edits and deployments require explicit owner authorization. The owner authorized this pilot release on 2026-09-12; that permission does not approve unresolved evidence or authorize future unrelated releases.

Sanity validation helps editors; it is not a server authorization boundary and API writes can bypass it. The website and generator therefore independently revalidate approval, evidence and expiry. Restrict production write credentials to the controlled publishing workflow. Do not give a listing agent an unrestricted publishing credential. Preserve Sanity revision history and add an editorial history entry for every research change. Export the prior record/revision before approved imports. Review status must be reset whenever text, scope or evidence changes; rerun validation and approval. Do not auto-upgrade supported claims.

## Pilot operation

Pilot data in `data/plant-reference/pilot.json` is an unpublished development fixture, not a second production owner. Production reads only approved published Sanity records and approved unique links. Local preview requires both development mode and `PLANT_REFERENCE_PREVIEW=1`; the UI labels it unpublished. Draft import file is delivered separately and has not been imported. No cron jobs or recurring automation are created.

The product component renders approved, non-actionable source facts with citations and a source-review date. Longer ecology and references go to `/plant-guides/[taxon]`. Private observations/history are excluded from production page props. Existing description copy is deliberately retained for owner review, so do not consider adding this component alone a completed catalog correction. Before release, apply the approved description corrections and recheck the combined rendered page for contradictory legacy wording and policy copy.

## Maintenance and gradual expansion

- At each sale/shipment: verify current destination restrictions, inventory treatment suitability where food use is claimed, availability and specimen details.
- Every 90 days: review safety, edibility, medicinal and processing claims; earlier for alerts, changed sources or customer incidents. Expired claims fail validation.
- Every six months: revisit invasive assessments and cultivation recommendations; check legal rules again when relevant to destination.
- Annually: review identity, synonym changes, ordinary care, mature-size context and source links; immediately when a source changes materially.
- After owner review of these five live plants and their combined website presentation: clear the remaining seven live listings in risk order, then add the orchid and culinary-herb draft examples before expanding in batches of five to ten. Research each taxon once and reuse it across cultivar-linked products where supported.

These are proposed human review cadences, not scheduled automations.
