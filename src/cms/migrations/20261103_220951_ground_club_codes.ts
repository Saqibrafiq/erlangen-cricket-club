import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

type GroundRow = { name: string; address: string; clubCode: string | null }

/**
 * The grounds of the Bayerischer Cricket Verband, from its CricClubs grounds list (Nov 2026),
 * provided by the club. Club codes link each club's teams (e.g. NCC-I, NCC-II) to their home
 * ground; clubs with several grounds have the code on their main one.
 */
const GROUNDS: GroundRow[] = [
  { name: 'Nürnberg – Pitch 1', address: 'Wacholderweg 25, Nürnberg', clubCode: 'NCC' },
  { name: 'Nürnberg – Pitch 2', address: 'Wacholderweg 25, Nürnberg', clubCode: null },
  { name: 'Diedorf', address: 'Schmetterlingsplatz 1, Diedorf', clubCode: null },
  { name: 'Augsburg – Eisenbahn-Sportanlage', address: 'Kobelweg 60, Augsburg', clubCode: null },
  { name: 'Attaching', address: 'Am Sportplatz 3, 85356 Freising', clubCode: 'BATCC' },
  { name: 'Coburg', address: 'Rodacher Straße 67, 96450 Coburg', clubCode: 'COCC' },
  { name: 'München – CCB', address: 'Fürstenrieder Straße 159, 81377 München', clubCode: 'CCB' },
  { name: 'Passau', address: 'Oberhaus 7, 94034 Passau', clubCode: 'CCP' },
  { name: 'Augsburg – Göggingen', address: 'Zugspitzstraße 173, 86165 Augsburg', clubCode: 'AUXCC' },
  {
    name: 'Regensburg',
    address: 'Bezirkssportanlage Ost, Guerickestraße 81a, 93053 Regensburg',
    clubCode: 'DJKF',
  },
  { name: 'Würmtal 1', address: 'Feodor-Lynen-Straße 2, 82152 Planegg', clubCode: 'DWCC' },
  { name: 'Würmtal 2', address: 'Georgenstraße 35, 82152 Planegg', clubCode: null },
  // CricClubs lists the club's postal address; the pitch is at the end of Siedlerstraße.
  { name: 'Erlangen Cricket Ground', address: 'Siedlerstraße 1, 91056 Erlangen', clubCode: 'ECC' },
  { name: 'Amberg', address: 'Am Schanzl 7, 92224 Amberg', clubCode: 'AMCC' },
  { name: 'Landshut', address: 'Siemensstraße 2, 84030 Landshut', clubCode: 'LACC' },
  { name: 'Bamberg', address: 'Armeestraße 57, 96050 Bamberg', clubCode: 'BACC' },
  { name: 'Hall 1 (Taufkirchen)', address: 'Köglweg 99, 82024 Taufkirchen', clubCode: null },
  { name: 'Hall 2 (München)', address: 'Astrid-Lindgren-Straße 3, 81829 München', clubCode: null },
  {
    name: 'Herschfeld',
    address: 'Robert-Heim-Weg 1, 97616 Bad Neustadt an der Saale',
    clubCode: null,
  },
  { name: 'München – MCC', address: 'Himmelreichstraße 5, 80538 München', clubCode: 'MCC' },
  { name: 'München – POCC', address: 'Weitlstraße 129, 80935 München', clubCode: 'POCC' },
  {
    name: 'Pfaffenhofen',
    address: 'Scheyerer Straße 51, 85276 Pfaffenhofen an der Ilm',
    clubCode: 'PFCC',
  },
  { name: 'München – SSC', address: 'Max-Reinhardt-Weg 28, 81739 München', clubCode: 'SSC' },
  // CricClubs names the club SGMCC, but its teams play as SGMC.
  { name: 'Moosburg', address: 'Am Stadion, 85368 Moosburg an der Isar', clubCode: 'SGMC' },
  { name: 'Lohhof', address: 'Hartmut-Hermann-Weg 4, 85716 Unterschleißheim', clubCode: 'SVL' },
  { name: 'Puchheim', address: 'Krautgartenweg, 82178 Puchheim', clubCode: null },
  { name: 'St. Ottilien', address: 'Erzabtei 38, 86941 Eresing', clubCode: 'STOLN' },
  { name: 'Ingolstadt – Haunwöhr', address: 'Langgasse 10, 85051 Ingolstadt', clubCode: 'INRS' },
  {
    name: 'Kirchanschöring',
    address: 'Laufener Straße 25, 83417 Kirchanschöring',
    clubCode: 'SKCC',
  },
  {
    name: 'Burghausen',
    address: 'Franz-Alexander-Straße 7, 84489 Burghausen',
    clubCode: 'SVWB',
  },
  { name: 'Taufkirchen', address: 'Köglweg 99, 82024 Taufkirchen', clubCode: 'SDTCC' },
  { name: 'Oberhaching', address: 'Im Loh 2, 82041 Oberhaching', clubCode: null },
  { name: 'Gersthofen', address: 'Schubertstraße 66, 86368 Gersthofen', clubCode: 'TSVGC' },
  { name: 'Bad Reichenhall', address: 'Nonner Au 1, 83435 Bad Reichenhall', clubCode: 'BGLCC' },
  { name: 'Gilching', address: 'Talhofstraße 13, 82205 Gilching', clubCode: 'GPCC' },
  { name: 'Hofolding', address: 'Fichtenstraße 33, 85649 Brunnthal', clubCode: null },
  { name: 'Würzburg (Dipbach)', address: 'Am Sportgelände, 97241 Dipbach', clubCode: 'WUC' },
  { name: 'Tittmoning', address: 'Salzachau 1, 84529 Tittmoning', clubCode: 'TITCC' },
  { name: 'Schweinfurt', address: 'Lindenbrunnenweg 51, 97422 Schweinfurt', clubCode: 'SWCC' },
  {
    name: 'Kempten',
    address: 'Sportanlage Riederau, Dieselstraße 5, 87437 Kempten (Allgäu)',
    clubCode: 'TVKCC',
  },
  { name: 'Tegernsee', address: 'Überfahrtweg 3, 83684 Tegernsee', clubCode: 'TCC' },
  { name: 'Pfarrkirchen', address: 'Peter-Adam-Straße 52, 84347 Pfarrkirchen', clubCode: null },
  { name: 'Eggenfelden', address: 'Birkenallee 6, 84307 Eggenfelden', clubCode: null },
  {
    name: 'Ingolstadt – Friedrichshofen',
    address: 'Ochsenmühlstraße 20, 85049 Ingolstadt',
    clubCode: 'INCC',
  },
  { name: 'Hof (Moschendorf)', address: 'Hofer Weg, 95182 Döhlau', clubCode: null },
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "grounds" ADD COLUMN "club_code" varchar;
  CREATE UNIQUE INDEX "grounds_club_code_idx" ON "grounds" USING btree ("club_code");`)

  // A ground someone already saved keeps its address; only gaps are filled in.
  for (const { name, address, clubCode } of GROUNDS) {
    await db.execute(sql`
     INSERT INTO "grounds" ("name", "address", "club_code")
     VALUES (${name}, ${address}, ${clubCode})
     ON CONFLICT ("name") DO UPDATE SET
       "address" = COALESCE("grounds"."address", EXCLUDED."address"),
       "club_code" = COALESCE("grounds"."club_code", EXCLUDED."club_code");`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const { name } of GROUNDS) {
    await db.execute(sql`
     DELETE FROM "grounds" WHERE "name" = ${name}
       AND "id" NOT IN (SELECT "ground_id" FROM "fixtures" WHERE "ground_id" IS NOT NULL);`)
  }
  await db.execute(sql`
   DROP INDEX "grounds_club_code_idx";
  ALTER TABLE "grounds" DROP COLUMN "club_code";`)
}
