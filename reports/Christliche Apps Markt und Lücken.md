# Christliche Apps: Markt und Lücken

**Recherchebericht für Kolja (Bleibe), Stand Oktober 2026**

Leitfrage: Welche christlichen Apps gibt es bereits (international und im deutschsprachigen Raum), was ist die Kritik daran, und welche App für Christen fehlt aktuell komplett?

Grundlage: sechs Recherche-Notizen unter `research_notes/Christliche Apps Markt und Lücken/` (ca. 150 WebSearch-Abfragen in Englisch und Deutsch, ca. 25 GitHub-/npm-Abfragen, 12 vollständig gelesene Repositories). Methodische Einschränkung, die für den gesamten Bericht gilt: Der Volltext-Abruf von Webseiten war in der Recherche-Umgebung blockiert. Fast alle Zahlen stammen daher aus Suchergebnis-Auszügen der verlinkten Quellen, nicht aus gegengelesenen Originalseiten. Nur GitHub-, SourceForge- und npm-Quellen wurden vollständig gelesen. Angaben aus Vergleichsblogs von Konkurrenzanbietern (learnofchrist.com, stillbible.app, psalmo.app, doxa.app, bibleinyear.com) sind als „sekundär" markiert. Widersprüchliche Zahlen werden als solche benannt. Alle Zahlen sind vor einer Veröffentlichung gegen die Originalquelle zu prüfen.

---

## 1. Kurzfassung

YouVersion dominiert den Markt der Bibel-Apps mit über einer Milliarde Geräte-Installationen (November 2025) und hat den Bibeltext selbst zur kostenlosen Infrastruktur gemacht (YouVersion Platform, März 2026); alle anderen Bibel-Apps liegen ein bis zwei Größenordnungen darunter. Im Gebets- und Andachtssegment führen VC-finanzierte Abo-Apps (Hallow ca. 157 Mio. USD Funding, Glorify ca. 80–85 Mio. USD, Pray.com ca. 34–38 Mio. USD); daneben existiert ein spendenfinanziertes, werbefreies Segment (Lectio 365, First 5, Our Daily Bread, BibleProject, Blue Letter Bible), das belegt, dass Spendenmodelle tragen. Ein funktionierendes christliches soziales Netzwerk gibt es 2026 nicht; seit 2007 sind nahezu alle Versuche an fehlender kritischer Masse, Kosten und Moderationslast gescheitert, und Gemeinde-Plattformen (Church Center, Subsplash, ChurchTools, Communi) sind an die eigene Gemeinde gebunden. Im deutschsprachigen Raum sind die größten belegten aktiven Nutzerbasen Gemeinde-Organisationsplattformen (ChurchTools ca. 163.000, Communi ca. 100.000 Nutzer in 30 Tagen), während kirchliche Bibel- und Andachts-Apps (Die-Bibel.de, KonApp, Losungen) jeweils bei rund 100.000 Downloads liegen. Die zentrale deutsche Eintrittsbarriere ist die Lizenzlage: Alle modernen Übersetzungen (Luther 2017, BasisBibel, Einheitsübersetzung, NGÜ, Hoffnung für alle, Schlachter 2000, Elberfelder 2006) sind geschützt, ERF Bibleserver bietet bewusst keine Content-API, und frei nutzbar sind nur Texte von vor 1940 sowie Schlachter 1951 mit widersprüchlich belegtem Status. Die Kritik an bestehenden Apps bündelt sich bei Datenschutz (Data-Broker-Klausel bei Pray.com, Mozilla-Warnlabel 2022, Art. 9 DSGVO), Kommerzialisierung (Abo-Tricks, Werbeflut, VC-Druck), politischer Vereinnahmung (Thiel/Vance, Tucker Carlson), Gamification als Selbstoptimierung (DFG-Projekt Passau), Benachrichtigungsflut und KI-Fehlzitaten (15–60 % laut YouVersion-CEO). Die belegten Bedürfnisse sind relational: Einsamkeit (29 % der Gen Z), Beziehung vor Predigt (57 % der jungen Christen), Kleingruppen „like family" (68 % vs. 28 % Gemeinschaftserleben), und sie werden bevorzugt physisch erfüllt (54 % der Gen Z, 40 % der Christen lehnen eine rein digitale Gemeinde ab). Es fehlt eine App, die Bibel, Gebet und kleine moderierte Gemeinschaft für Menschen mit und ohne Gemeinde verbindet, Präsenzbegegnung anbahnt statt ersetzt, werbefrei und Art.-9-konform ist, ohne Streak-Druck und ohne generative Theologie auskommt und als deutschsprachiges Open-Source-Projekt existiert; diese Kombination ist weder kommerziell noch im Open-Source-Bereich belegt. Bleibe deckt mit Bibelreader, Gebetswand, Gruppen, Treffen, Moderation, Datenexport und Werbefreiheit bereits den Kern dieser Lücke ab; offen sind vor allem eine moderne deutsche Übersetzung, gemeinsame Lesepläne mit Gruppendiskussion, Safeguarding-Regeln für Minderjährige, eine Trägerschaft mit Finanzierung und die ausformulierte Art.-9-Einwilligung. Alle Zahlen dieses Berichts stammen aus Suchzusammenfassungen und nicht aus im Volltext gelesenen Quellen; sie sind vor Veröffentlichung zu prüfen, und Angaben aus Vergleichsblogs von Konkurrenzanbietern sind als unsicher gekennzeichnet.

---

## 2. Marktlandschaft international

### 2.1 Bibel-Apps

**Marktführer YouVersion (Life.Church).** Die „Family of Apps" (Bible App, Bible App Lite, Bible App for Kids) überschritt im November 2025 eine Milliarde Geräte-Installationen ([YouVersion News](https://www.youversion.com/news/bible-app-reaches-one-billion-installs); [idea.de](https://www.idea.de/artikel/eine-milliarde-downloads-bibel-app-youversion-feiert-rekord)). 2025 stiegen Installs um über 12 % und die tägliche Nutzung um 18 % gegenüber 2024 ([The Citizen](https://www.thecitizen.co.tz/tanzania/news/national/youversion-bible-app-hits-one-billion-installs-launches-global-bible-month-5297860)). 2024 wurden im Schnitt 11,2 Mio. neue Installs pro Monat und rund 14 Mio. täglich aktive Bibelleser gemeldet ([Evangelical Focus](https://evangelicalfocus.com/life-tech/29263/philippians-46-the-most-shared-bible-verse-in-2024); [CBN](https://cbn.com/news/us/bible-app-engagement-spikes-and-most-read-verse-2024-says-lot-about-our-world)). Am Neujahrstag 2025 abonnierten über 3 Mio. Menschen Einjahres-Bibelpläne (+18 %) ([PR Newswire](https://www.prnewswire.com/news-releases/youversion-announces-2025-verse-of-the-year-as-bible-engagement-reaches-new-heights-globally-302632694.html)). Das Engagement mit der Gebetsfunktion stieg 2024 um 46 % ([YouVersion News 2024](https://www.youversion.com/news/youversions-verse-of-the-year-reflects-global-trend-of-seeking-peace-through-prayer)). Das Wachstum kommt überproportional aus Afrika und Südasien (z. B. Burundi +209 % tägliche Nutzung 2024, [CBN](https://cbn.com/news/us/bible-app-engagement-spikes-and-most-read-verse-2024-says-lot-about-our-world)); DACH-Zahlen veröffentlicht YouVersion nicht. YouVersion kommuniziert keine MAU, nur Installs, „daily engagement" und App-Opens.

Mit der **YouVersion Platform** (März 2026) stellt Life.Church einen einbettbaren Bibelreader mit 1.487 Bibeln von 36 Verlagen in 1.283 Sprachen kostenlos für Dritt-Apps bereit ([YouVersion: Introducing YouVersion Platform](https://www.youversion.com/news/introducing-youversion-platform)). SDKs für React, Kotlin, Swift und React Native sind Apache-2.0-lizenziert; ein App-Key ist Pflicht, externe Pull Requests werden „not yet" angenommen ([platform-sdk-react README](https://raw.githubusercontent.com/youversion/platform-sdk-react/main/README.md)). Folgerung der Notizen: Der reine Bibeltext ist kommodifiziert; Differenzierung entsteht über Gewohnheit/Audio, Lernkuratierung, Studienbibliothek oder Gemeinschaft.

**Weitere Bibel-Apps im Überblick** (Zahlen aus Suchauszügen, nicht gegengelesen):

| App | Betreiber / Modell | Reichweite (Angabe, Quelle) | Besonderheit | Hauptkritik |
|---|---|---|---|---|
| YouVersion | Life.Church, kostenlos, spendenfinanziert (~40.000 Spender; Angabe „nearly $60 million lifetime" unsicher) ([YouVersion Giving](https://www.youversion.com/giving); [Growth Case Study, sekundär](https://growthcasestudies.com/p/youversion)) | 1 Mrd. Installs (11/2025) | Sprachabdeckung, Freundes-/Gebetsnetzwerk, Plans with Friends, Kids-App | Feed-Clutter, Benachrichtigungsflut, Datensammlung, Kinderschutz, keine Urtext-Tools ([learnofchrist, sekundär](https://learnofchrist.com/resources/youversion); [Trustpilot](https://www.trustpilot.com/review/bible.com?page=2)) |
| Logos | Faithlife Corp., seit Herbst 2024 Abo: Premium/Pro/Max 9,99/14,99/19,99 USD mtl. ([Bible Buying Guide](https://biblebuyingguide.com/logos-subscriptions-a-detailed-look-at-the-new-logos/)) | Android 1 Mio.+ Downloads ([Google Play](https://play.google.com/store/apps/details?id=com.logos.androidlogos&hl=en_US)) | Größte lizenzierte Bibliothek, KI-Assistenten (Study Assistant seit 4.11.2025, [Logos 46.0](https://community.logos.com/kb/articles/2919-logos-46-0)) | Preis, Abo-Umstellung mit Nutzerprotest, Performance, Firmenumbau 2025 (Verkauf Lexham Press, [Cascadia Daily](https://www.cascadiadaily.com/2025/sep/29/briefs-faithlife-exodus-pharmacy-expansion-company-confidence/)) |
| Olive Tree | Gospel Technologies LLC (seit 9/2020; 2014–2020 HarperCollins), In-App-Käufe + Abo 5,99 USD mtl. ([Olive Tree Press 2020](https://www.olivetree.com/press/pressrelease09112020.php); [App Store](https://apps.apple.com/us/app/bible-by-olive-tree-esv-kjv/id332615624)) | 8 Mio.+ Downloads ([Amazon](https://www.amazon.com/HarperCollins-Christian-Publishing-Bible-Olive/dp/B004N8W292)) | Resource Guide/Study Center neben dem Text | „consistently glitchy" ([AppGrooves](https://appgrooves.com/app/bible-by-olive-tree-by-harpercollins-christian-publishing-inc/negative)) |
| Blue Letter Bible | Sowing Circle (501c3, 1995), „no paid tiers, no premium content, and no ads" ([learnofchrist, sekundär](https://learnofchrist.com/resources/blue-letter-bible)) | „over 1,000,000 users per month" ([BLB FAQ](https://www.blueletterbible.org/about/faqs.cfm)); Android 2,9 Mio. ([AppBrain](https://www.appbrain.com/app/blue-letter-bible/org.blueletterbible.blb)) | Kostenlose Urtext-Werkzeuge (Interlinear, Strong's, 8.000+ Kommentare) | Veraltete Oberfläche (nur Review-Blogs, nicht primär belegt) |
| Bible Gateway | HarperCollins Christian Publishing, werbefinanziert (Salem Web Network) + Plus-Abo; Preisangaben widersprüchlich (4,99–9,99 USD mtl.) ([Wikipedia](https://en.wikipedia.org/wiki/BibleGateway); [Softwr](https://www.softwr.com/pricing/bible-gateway)) | 18–25 Mio. monatliche Besucher ([Niche Pursuits](https://www.nichepursuits.com/bible-gateway-success-story/)) | Multi-Übersetzungs-Vergleich | Blinkende/Vollbild-Werbung, ca. 3,1/5 ([Trustpilot](https://www.trustpilot.com/review/www.biblegateway.com)) |
| BibleProject | Nonprofit (Portland, 2014), 100 % spendenfinanziert, 26,7 Mio. USD Umsatz 2023, 50.000+ Unterstützer ([MinistryWatch](https://ministrywatch.com/bibleproject-experiences-rapid-growth-going-into-seventh-year/)) | Android 500k+ ([Google Play](https://play.google.com/store/apps/details?id=com.bibleproject&hl=en_US)) | Animationsvideos, geführte Lesereise („the journey") | Keine gefunden (Lücke) |
| Dwell | Dwell (Kickstarter 2018, 128.859 USD), Abo 59,99 USD/Jahr, kein Free-Tier ([Dwell Pricing](https://dwellapp.io/pricing); [Dwell Press](https://dwellapp.io/press/dwell-kickstarter-successful-fourth-most-funded-app-ever)) | 3 Mio.+ Installs ([faith.tools](https://faith.tools/app/18-dwell)) | Hochwertige Audio-Erfahrung, 20+ Stimmen | „access to God's word should be free", Zwangs-Trial ([stillbible, sekundär](https://stillbible.app/compare/dwell-review)) |
| Bible.is → Hosanna | Faith Comes By Hearing (501c3, 1972), „no subscriptions, no paywalls, and no third-party ads" ([Google Play: Hosanna](https://play.google.com/store/apps/details?id=com.fcbh.polybible&hl=en_US)) | Bible.is 5 Mio.+ Google Play ([Google Play](https://play.google.com/store/apps/details?id=com.faithcomesbyhearing.android.bibleis&hl=en_US)) | Audio/Video in 2.695 bzw. 2.776 Sprachen | Zwangsmigration zu Hosanna, Funktionsverlust (Sleep-Timer) |
| Glorify | London (2020), VC ca. 80–85 Mio. USD, Glorify+ ca. 9,99 USD mtl./59,99 USD Jahr ([TechCrunch](https://techcrunch.com/2021/12/02/glorify-an-ambitious-app-for-christians-just-landed-40-million-in-series-a-funding-led-by-a16z/)) | „25 million" Downloads (3/2025, [Christianity Today](https://www.christianitytoday.com/2025/03/devotion-prayer-app-glorify-tim-timberlake/)); Angaben 1–25 Mio. widersprüchlich | Devotional/Meditation/Journal statt Bibelstudium; Fusion mit Confidein 5/2026, „Glorify Ring" ([CBN](https://cbn.com/news/us/faith-tech-merger-glorify-offers-worlds-first-christian-smart-ring)) | Paywall-Creep, Kündigungsprobleme ([Trustpilot](https://www.trustpilot.com/review/glorify.com)) |
| Accordance | OakTree Software, Einmalkauf 49,90–4.399 USD ([Accordance 2025](https://www.accordancebible.com/start-the-year-right-2025/)) | Keine Nutzerzahlen gefunden | Mac-native Originalsprachen-Forschung, „Human-built. AI-enhanced" | Kein v15 in 2025 nach Tod von David Lang (10.5.2025) ([Accordance Forums](https://forums.accordancebible.com/topic/37578-accordance-15-planned/)) |
| e-Sword | Rick Meyers (Einzelentwickler, seit 2000), gratis + Premium-Module über eStudySource ([e-Sword History](https://www.e-sword.net/history.html)) | 15 Mio. Downloads bis 2010 (offiziell); „40 Mio." (Review-Blog 2026, unverifiziert) | Windows-Klassiker, Gebetslisten seit v13.1 (5/2025) | Keine belegt |
| STEP Bible | Tyndale House Cambridge (2013), kostenlos, keine Werbung ([AppAdvice](https://appadvice.com/app/step-bible/1476903313)) | Android 33.000 Downloads, App am 10.11.2024 aus Google Play entfernt ([AppBrain](https://www.appbrain.com/app/step-bible-scripture-tools-fo/com.tyndale.stepbible)) | Kostenlose Urtext-Werkzeuge für Majority-World-Pastoren | Android-App verschwunden |
| Bible Hub | Online Parallel Bible Project (privat, ehrenamtlich, kein Nonprofit) ([biblehub.com/about](https://biblehub.com/about.htm)) | Keine belastbaren Zahlen | ~30 englische Übersetzungen parallel, eigene Berean Standard Bible (Public Domain seit 30.4.2023, [Berean Bible Committee](https://berean.bible/committee.htm)) | Keine gefunden |

**Standard vs. Alleinstellung.** Standard bei fast allen Apps: mehrere Übersetzungen, Audio, Lesepläne, Markierungen/Notizen, Offline-Modus, Vers des Tages, Geräte-Sync. Eine Lücke in der Feature-Landschaft laut Notizen: Kaum eine App kombiniert kostenlose Urtext-Werkzeuge (BLB/STEP-Niveau) mit moderner UI und Community (YouVersion-Niveau) ([Bibel-Apps-Notiz, Inferences](https://learnofchrist.com/resources/olive-tree)).

**Community-Funktionen in Bibel-Apps.** Echte soziale Funktionen hat fast nur YouVersion: Freunde, geteilte Highlights/Notizen/Gebete, „Plans with Friends" (seit November 2017, Limit 300 Teilnehmer) und Kirchen-Anbindung ([YouVersion Blog 2017](https://blog.youversion.com/2017/11/youversion-bible-app-announcing-plans-with-friends-2017/); [Life.Church Open](https://open.life.church/resources/3488-plans-with-friends); [youversion.church](https://www.youversion.church/)). Die Gebetsfunktion (März 2020) sammelte in der ersten Woche über 1 Mio. Gebete ([YouVersion Press](https://www.youversion.com/press/youversion-community-creates-1-million-prayers-during-first-week-of-new-bible-app-prayer-feature/)). Logos' Faithlife-Community hat sich nie durchgesetzt; Faithlife stieg zum 30.6.2023 aus dem Church-Management aus ([Logos Community](https://community.logos.com/discussion/210463/product-news-faithlife-is-exiting-church-management/p1)). Nutzungszahlen zu „Plans with Friends" veröffentlicht YouVersion nicht.

**KI in Bibel-Apps (2024–2026).** Logos ist Vorreiter (Smart Search, Sermon Assistant, Study Assistant mit kreditbasierten Kontingenten je Abo-Stufe) ([Logos Support: AI Credits](https://support.logos.com/hc/en-us/articles/23563051328269-About-AI-Credits)); Rezeption gemischt, mit Ethikdebatte um KI-Predigten ([Christ Over All](https://christoverall.com/article/concise/encore-a-brave-new-world-of-preaching-logos-ai-sermon-assistant-and-the-ethics-of-sermon-prep/)). YouVersion verzichtet bewusst auf einen Theologie-Chatbot; CEO Bobby Gruenewald: Selbst das beste Modell zitiere die Bibel „at least 15% of the time" falsch, manche „as much as 60% of the time" ([Christian Daily International](https://www.christiandaily.com/news/ais-scripture-problem-misquotes-range-from-15-to-60-says-youversion-ceo); [idea.de](https://www.idea.de/artikel/youversion-gruender-ki-zitiert-die-bibel-oft-falsch)). YouVersion veröffentlichte 2026 einen deterministischen LLM-Bibelzitat-Benchmark (11 Sprachen, Halluzinations-Score) ([Benchmark README](https://raw.githubusercontent.com/youversion/biblelab-bible-accuracy-benchmark/main/README.md)). Reine KI-Chat-Apps wachsen stark: Bible Chat (Rumänien) mit 14 Mio. USD Series A, 10 Mio. Nutzern, 15 Mio. USD annualisiertem Umsatz ([Vestbee](https://www.vestbee.com/insights/articles/bible-chat-secures-14-m)) bzw. „north of 25 million downloads" ([learnofchrist, sekundär](https://learnofchrist.com/resources/bible-chat)); Sensor Tower: 500k Downloads/900k USD Umsatz im letzten gemessenen Monat ([Sensor Tower](https://app.sensortower.com/overview/6448849666?country=US)).

### 2.2 Gebets-, Meditations- und Andachts-Apps

**VC-finanzierte Schwergewichte.**

- **Hallow** (katholisch, Chicago, gegründet Dez. 2018): geschätzt ca. 40 Mio. USD Netto-Umsatz 2025, ca. 280.000 Downloads/Monat im Jahresmittel 2025, 263.000 Downloads allein am Aschermittwoch 2026 (ca. 25-faches Tagesmittel) ([Appfigures](https://appfigures.com/resources/insights/hallow-lent-surge-prayer-app-revenue)); 22–25 Mio. Downloads je nach Quelle und Zeitpunkt ([faith.tools](https://faith.tools/app/30-hallow); [RevenueMemo](https://www.revenuememo.com/p/who-owns-hallow)); über 1 Mrd. gebetete Gebete ([Hallow Blog](https://hallow.com/blog/hallow-celebrates-1-billion-prayers-prayed/)). Funding: Series B 40 Mio. USD (Nov. 2021), Series C 50 Mio. USD (Mai 2023, Goodwater), gesamt ca. 157 Mio. USD laut Tracxn ([Fortune](https://fortune.com/2021/11/03/catholic-prayer-app-hallow-gets-40-million-in-funding); [Dealroom](https://app.dealroom.co/news/feed/hallow-raises-50m-series-c-funding); [Tracxn](https://tracxn.com/d/companies/hallow/__KTAm122vA7UhIoIBJEq8-DwcfbdA9OICMot6EdRuxfs)); eine andere Quelle nennt 105 Mio. USD ([Contrary Research](https://research.contrary.com/company/hallow)). Peter Thiel und J.D. Vance investierten laut NYT (via katholisch.de) zusammen rund 40 Mio. USD ([katholisch.de](https://katholisch.de/artikel/56435-welche-rolle-spielt-die-gebetsapp-hallow-bei-den-us-wahlen)). Preise USA: 69,99 USD/Jahr, 9,99 USD/Monat, Family 119,99 USD ([help.hallow.com](https://help.hallow.com/en/articles/2880438-how-much-does-the-subscription-cost)); Deutschland 9,99 €/69,99 € ([all4phones.de](https://all4phones.de/articles/hallow-die-beste-app-fuer-katholischen-glauben-gebet-meditation.1849/)). Einziger belegter Super-Bowl-Spot: 11.2.2024, Mark Wahlberg und Jonathan Roumie, ca. 8 Mio. USD, 14 Märkte ([NCR](https://www.ncronline.org/news/more-hail-mary-pass-prayer-apps-ad-aims-bring-devotion-super-bowl)); danach Platz 1 der kostenlosen Apps im App Store ([NewsNation](https://www.newsnationnow.com/religion/hallow-prayer-app-climbs-no-1-free-app-apple/)). Pray40-Fastenchallenge 2025 mit „nearly two-million people" ([Hallow Pray40](https://hallow.com/pray40/)), 2026 „well over 1.5 million" ([ChurchLeaders](https://churchleaders.com/news/2213701-hallow-app-ceo-demonic-audio-lent-prayer-challenge.html)). Ca. 50 % der Neunutzer identifizieren sich nicht primär als katholisch ([LA Catholics](https://lacatholics.org/2026/04/01/catholic-church-sees-massive-growth-in-new-members-in-2026/)). KI: Magisterium AI seit März 2025 integriert, nicht deaktivierbar, Fragen nicht zum Training genutzt ([help.hallow.com: Magisterium AI FAQ](https://help.hallow.com/en/articles/10601094-magisterium-ai-faq)); „Hallow AI" 2026 „grounded in trusted Catholic sources" ([help.hallow.com: Hallow AI FAQ](https://help.hallow.com/en/articles/13601993-hallow-ai-faq)).
- **Pray.com** (Santa Monica, 2016): Funding ca. 34–38 Mio. USD (TPG Growth, Science Inc., Citi Ventures u. a.) ([Dealroom](https://dealroom.co/companies/pray-com/)); „more than 17 million people" Reichweite, 220 Mio.+ Podcast-Downloads ([A. Larry Ross](https://www.alarryross.com/praycom)); Umsatzschätzungen widersprüchlich (1–10 Mio. USD bei Dealroom/Tracxn bis 45–55 Mio. USD bei einer unbelegten Blogquelle); Premium ca. 69,99 USD/Jahr ([help.pray.com](https://help.pray.com/hc/en-us/articles/15255693841565-Pray-com-Subscription-Plans)); bietet einen „Pray AI companion" ([learnofchrist, sekundär](https://learnofchrist.com/resources/pray-com)).
- **Glorify**: siehe 2.1; 2022 „around 250,000 daily users, mostly in the US and Brazil" ([Yahoo/Tech](https://tech.yahoo.com/general/articles/softbank-celebrities-back-funding-faith-140309790.html)); Hybridmodell: jedes Abo sponsert eine Gratismitgliedschaft ([Glorify Zendesk](https://glorify-app.zendesk.com/hc/en-gb/articles/360020071740-Why-do-I-have-to-pay-to-use-Glorify)).
- **Abide** (2014, Ex-Google-Ingenieure; seit 25.10.2021 Teil des Non-Profit-Verlags Guideposts): 2021 1,5 Mio. Hörer/Monat; Abo 9,99 USD/Monat bzw. ca. 39,99 USD/Jahr ([MediaPost](https://www.mediapost.com/publications/article/368076/guideposts-acquires-abide-christian-prayer-app.html?edition=124085); [learnofchrist, sekundär](https://learnofchrist.com/resources/abide)).

**Spendenfinanziertes, werbefreies Segment.**

| App | Träger | Reichweite (Quelle) | Modell |
|---|---|---|---|
| Lectio 365 | 24-7 Prayer (UK), seit Advent 2019 | 2 Mio.+ Downloads (3/2026), 330.000+ Nutzer/Monat, 50 Mio.+ Gebetszeiten 2025 ([lectio365.com/keep-free](https://lectio365.com/keep-free/); [lectio365.com/the-app](https://lectio365.com/the-app/)) | „no ads, no in-app purchases", komplett spendenfinanziert; deutsche Inhalte über 24-7 Prayer Deutschland/Schweiz ([24-7prayer.de](https://24-7prayer.de/lectio-365-auf-deutsch/)) |
| First 5 | Proverbs 31 Ministries (USA) | – | Kostenlos, „no premium tier" ([learnofchrist, sekundär](https://learnofchrist.com/resources/first-5)) |
| Our Daily Bread | Our Daily Bread Ministries | 5 Mio.+ Google Play, 20+ Sprachen ([faith.tools](https://faith.tools/app/315-our-daily-bread)) | Ministry-finanziert |
| Bible in One Year | Alpha International (UK) | 500.000+ Google Play, „over 1.5 million users" ([bible.alpha.org](https://bible.alpha.org/en/about/)) | Kostenlos |
| Daily Audio Bible | Brian Hardin (USA), Podcast seit 1.1.2006 | ältere Angaben 40–100 Mio. Downloads (ca. 2018, veraltet) ([HM Magazine](https://hmmagazine.com/daily-audio-bible-a-popular-podcast/)) | Spenden |
| PrayerMate | Discipleship Tech (UK) | 314.000 Downloads, 115.000 Nutzer ([Eternity News](https://eternitynews.com.au/good-news/two-of-the-best-apps-to-fuel-your-prayers/)) | Kostenlos |
| Echo Prayer | Clover Sites (USA) | – | Freemium, ECHO+ 14,99 USD/Jahr ([Echo+](https://www.echoprayer.com/echo-plus)) |
| Soultime | UK (2018) | – | Abo ca. 39,99 USD/Jahr, „cheapest of the major Christian meditation apps" ([learnofchrist, sekundär](https://learnofchrist.com/resources/soultime)) |
| She Reads Truth | USA (2012) | ≥ 400.000 Geräte ([App Store](https://apps.apple.com/us/app/she-reads-truth/id892128363)) | Abo |

Befund der Notizen: Das spendenfinanzierte Segment ist fast ausschließlich evangelisch/überkonfessionell; eine ökumenische, werbefreie, spendenfinanzierte Gebets-App mit Hallow-ähnlicher Produktqualität ist nicht sichtbar. Lectio 365 belegt, dass Spendenfinanzierung bei 330.000 MAU trägt; die Reichweite bleibt aber um Faktor 10–20 unter Hallow, mutmaßlich wegen fehlender Marketingbudgets (Inferenz).

**Jesus-Chatbots.** „Text With Jesus" (Catloaf Software, seit Juli 2023, GPT-basiert, 3,99 USD/Monat, optionaler „Satan"-Chat): ca. 150.000 Registrierungen, „thousands of paying subscribers", 4,7 Sterne ([KTVU](https://www.ktvu.com/news/text-jesus-ai-chatbot-app-grows-rapidly-despite-criticism); [Washington Times](https://www.washingtontimes.com/news/2023/nov/22/ai-generated-jesus-satan-offers-customers-opportun/)). Der Gründer beschreibt sich als „not particularly religious" und konsultierte vor dem Launch keine Theologen.

### 2.3 Community-, Social- und Gemeinde-Plattformen

**Christliche soziale Netzwerke.** 2026 existiert kein christliches soziales Netzwerk mit nachweisbar großer, aktiver Nutzerbasis. Die verbliebenen Anbieter (MCSN, CSN, FaithCircle, ChristiansLikeMe, ActsSocial) sind Nischenprodukte ohne unabhängig belegte Nutzerzahlen ([ActsSocial Blog](https://actssocial.com/blog/best-christian-social-media-apps)). Von 40 christlichen Netzwerken einer Liste von 2009 waren 2011 nur noch 3 online ([djchuang.com](https://djchuang.com/list-of-christian-social-networks/)). Schließungen: GodTube/Tangle (Relaunch 2009, Traffic-Einbruch 75 %, Einstellung 1.12.2010, [Wikipedia](https://en.wikipedia.org/wiki/Godtube)), MyChurch (2008: ca. 21.000 Gemeinden, 150.000 Mitglieder, [Christian Century](https://www.christiancentury.org/article/2008-08/churches-using-internet-social-networking)), Xianz (2007), ChristianChirp (2009, über 50 Hacking-Angriffe im ersten Monat, [James L. Paris](https://blog.christianmoney.com/2013/06/what-happened-to-christianchirp.html)), FaithVillage (2012–2014), SocialCross (2017–2019), FaithSocial (2020 bis 21.12.2022: „could no longer sustain itself", [faithsocial.com](https://faithsocial.com/)). Genannte Gründe: fehlende kritische Masse („these Christian sites have hardly anyone on them", [Christian Educators Academy](https://christianeducatorsacademy.com/is-there-a-christian-alternative-to-facebook/)), Finanzierung, Sicherheits-/Moderationslast; 97 % der US-Gemeinden nutzen ohnehin Mainstream-Social-Media ([GlobeNewswire 2026](https://www.globenewswire.com/news-release/2026/03/09/3251986/0/en/pushpay-and-barna-group-s-2026-state-of-church-technology-report-shows-church-tech-has-moved-past-adoption-now-alignment-is-what-matters.html)). Gab (2016, Andrew Torba) vermarktet sich als „parallel Christian economy", wird von SPLC und ADL aber als rechtsextreme Plattform dokumentiert ([SPLC](https://www.splcenter.org/resources/extremist-files/gab/); [ADL](https://www.adl.org/resources/article/andrew-torba-five-things-know)). Christianity Today (Nov. 2025): Digitale Technik produziere „more communication but not more community" ([CT](https://www.christianitytoday.com/2025/11/christianity-at-a-crossroads-hempton/)).

Muster laut Notizen: Erfolgreiche Produkte lösen zuerst ein individuelles Bedürfnis (Bibel lesen, beten, hören) und fügen Community als Zusatz hinzu; der umgekehrte Weg (Netzwerk zuerst) ist bisher nicht gelungen. Genutzte Community-Mechaniken sind „bounded" (Freundeskreis, Kleingruppe ≤ 300, zeitlich begrenzte Challenges) und an konkrete Praktiken (Plan, Gebet) gekoppelt, nicht offene Feeds.

**Gemeinde-Plattformen (ChMS).** 67 % der US-Gemeinden nutzen eine App, 87 % streamen Gottesdienste ([Pushpay 2025](https://www.globenewswire.com/news-release/2025/04/30/3071371/0/en/pushpay-s-2025-state-of-church-tech-report-reveals-digital-tools-are-strengthening-faith-fueling-connection-and-shaping-the-future-of-ministry.html)); 69 % nutzen Online-Giving ([Lifeway](https://research.lifeway.com/2025/03/31/2-tech-changes-that-can-increase-giving/)). Anbieter: Planning Center/Church Center, Subsplash (Messaging seit 2024 mit Wort-/Bildfiltern, [Subsplash](https://www.subsplash.com/blog/introducing-subsplash-messaging)), Pushpay/CCB, Tithe.ly/Breeze (ab 72 USD/Monat), Churchteams (ab 37 USD/Monat), Realm (200–500+ USD/Monat), Pushpay (ab 199 USD/Monat) ([ChurchMemberPro](https://churchmemberpro.com/blog/best-church-management-software/)). Marktgrößenangabe 17,26 Mrd. USD (2025) laut einem Marktforschungsbericht ist nicht verifiziert und erscheint unplausibel ([Market Research Future](https://www.marketresearchfuture.com/reports/church-management-software-market-23745)). Life.Church „Church Online Platform" (kostenlos): 38.428 Gemeinden seit 2011 ([churchonlineplatform.com](https://churchonlineplatform.com/)). Review-Kritik an Church Center: fehlende Nachrichtensuche, Unread-Status-Bug ([App Store: Church Center](https://apps.apple.com/us/app/church-center-app/id1357742931)). Strukturelle Lücke: ChMS sind mandantengebunden; es gibt keinen Einstieg für Menschen ohne Gemeinde, keine gemeindeübergreifende Suche nach Menschen/Gruppen.

**Messenger-Nutzung in Gemeinden.** WhatsApp dominiert; Probleme: verschüttete Infos ([Usermesh](https://usermesh.com/2026/07/07/church-whatsapp-group-problems/)), Offenlegung von Nummern „without active consent", „unsafe" für Gruppen mit Minderjährigen ([eDisciples](https://www.edisciples.com/news/general/the-dangers-of-running-a-church-whatsapp-group/)), „orphaned chat threads" beim Weggang Ehrenamtlicher ([Jovo](https://www.jovoapp.com/en-us/blog/why-churches-outgrow-whatsapp---7-risks-and-fixes)). Discord: Online-Gemeinden, Jugend; DMs sind für Moderatoren unsichtbar („accountability blind spots"), private 1:1-Kanäle Erwachsene/Minderjährige sind das wiederkehrende Setting bei Kinderschutzversagen ([Called](https://called.app/resources/5-christian-apps-for-youth-ministry-safety-and-which-ones-to-avoid/); [Diocese of Sheffield 2024](https://www.sheffield.anglican.org/wp-content/uploads/2024/07/Children-young-people-social-media-guidance.pdf)). Telegram: Broadcast-Kanäle (z. B. 36.000 Abonnenten bei Vladimir Savchuk, [t.me](https://t.me/pastorvladimirsavchuk)). Band, GroupMe (SMS-Fallback), Slack (nur Mitarbeitende).

**Content-Plattformen mit Kleingruppen-Werkzeugen.** The Chosen App (7,5 Mio.+ Downloads, Kommentare/Likes, [App Store](https://apps.apple.com/md/app/the-chosen/id6443956656)), RightNow Media (Groups, Watch Together, Zugang über Gemeindelizenz, [RightNow Media](https://www.rightnowmedia.org/us/app-features)) – content-first, an Lizenz oder Franchise gebunden, keine gemeindeübergreifende dauerhafte Community.

**Studien zu Einsamkeit und digitaler Gemeinde (USA).**

- Gen Z: 29 % häufig einsam, 26 % isoliert (Boomer 8 %); 54 % halten Präsenzbeziehungen für wertvoller als digitale ([Barna: Gen Z](https://www.barna.com/trends/gen-z-emotions/)).
- 48 % der Christen halten Beziehungen für wichtiger als eine anregende Predigt (42 %), unter Gen Z/Millennials 57 %; nur 10 % gehen in die Gemeinde, um Gemeinschaft zu finden ([Barna: Fostering Relationships](https://www.barna.com/trends/fostering-relationships-at-church/)).
- „Discipleship in Community" (n = 4.063, März 2024): Kleingruppen-Teilnehmende erleben zu 68 % (vs. 28 %) „deep and meaningful community"; 22 % derer ohne Kleingruppe wissen nicht, ob ihre Gemeinde eine anbietet; 36 % fühlen sich „not being discipled" ([Barna: 4 Barriers](https://www.barna.com/trends/discipleship-barriers/)).
- Pastoren: 65 % berichten Einsamkeit (2015: 42 %) ([Barna: Pastor Support Systems](https://www.barna.com/research/pastor-support-systems/)).
- „Love Jesus but not the Church": 10 % der US-Bevölkerung (2004: 7 %) ([Barna](https://www.barna.com/research/meet-love-jesus-not-church/)).
- 40 % der Christen würden ihre Gemeinde nicht besuchen, wenn sie rein online wäre ([Barna](https://www.barna.com/research/in-person-over-online-church/)); 23 % der US-Erwachsenen sehen mindestens monatlich Gottesdienste online/TV, 65 % selten/nie ([Pew RLS 2025](https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/)); 21 % nutzen Apps/Websites zum Schriftlesen, 14 % für Gebet ([Pew 2023](https://www.pewresearch.org/religion/2023/06/02/online-religious-services-appeal-to-many-americans-but-going-in-person-remains-more-popular/)); 26 % der Gemeindeglieder nehmen regelmäßig an Online-Worship teil ([EPIC](https://www.covidreligionresearch.org/study-shows-online-church-attendance/)).
- Präsenzteilnahme steigt 2025/26 erstmals seit Jahrzehnten ([Lifeway, Mai 2026](https://research.lifeway.com/2026/05/01/church-attendance-increases-for-the-first-time-in-decades/)); Gen Z und Millennials führen eine „resurgence" an und suchen „a community that offers rootedness and authority" ([Barna, Sept. 2025](https://www.barna.com/research/young-adults-lead-resurgence-in-church-attendance/)).
- Lifeway (April 2026): 3 von 5 Gemeindegliedern sind besorgt über den Einfluss von KI auf das Christentum; 1 von 10 Pastoren nutzt KI regelmäßig ([Lifeway](https://research.lifeway.com/2026/04/21/pastors-churchgoers-see-ai-as-concerning-and-confusing/)).

Deutschsprachige Repräsentativdaten zu Einsamkeit unter Christen oder zur Wirkung von App-Community-Funktionen wurden nicht gefunden (Lücke).

### 2.4 Geschäftsmodelle im Überblick

Drei Lager ([Bibel-Apps-Notiz](https://www.youversion.com/giving)):

1. **Spenden-/Ministry-Modelle ohne Werbung und Abo**: YouVersion, Blue Letter Bible, BibleProject (26,7 Mio. USD Umsatz 2023), Bible.is/Hosanna, STEP, e-Sword, Bible Hub, Lectio 365, First 5, Our Daily Bread, Bible in One Year, Daily Audio Bible, PrayerMate.
2. **Freemium/Abo**: Logos (9,99–19,99 USD/Monat), Dwell (59,99 USD/Jahr, kein Free-Tier), Glorify, Hallow, Pray.com, Abide, Soultime, She Reads Truth, Olive Tree, Bible Gateway Plus; Preisanker 40–70 USD/Jahr, niedrigere Punkte bei Echo+ (14,99 USD/Jahr) und Soultime (ca. 40 USD).
3. **Einmalkauf**: Accordance (49,90–4.399 USD).

VC-Zufluss: Glaubens-Apps zogen in einem Jahr (Kontext 2021) 175,3 Mio. USD ein, mehr als das Dreifache der 48,5 Mio. USD des Vorjahres ([Yahoo/TechCrunch](https://news.yahoo.com/hallow-religious-app-catholics-talks-202345783.html)). Sensor Tower: Downloads von „religion and spirituality"-Apps seit 2019 um 79,5 % gestiegen (Stand Oktober 2025) ([Awake America, zitiert Sensor Tower](https://www.awakeamerica.com/revival-news/bible-sales-faith-app-downloads-christian-music-streams-surge-signs-of-revival-in-america)).

Inferenz der Notizen: Zahlungsbereitschaft existiert für Audio-Gewohnheit (Dwell, Glorify, Hallow) und Profi-Bibliotheken (Logos), nicht für den Bibeltext. Abo-Modelle erzeugen in diesem Segment überproportional Vertrauensverluste („God's Word should be free"); Spenden und „sponsored subscriptions" sind das sozial akzeptierte Gegenmodell.

---

## 3. Deutschsprachiger Markt und Lizenzlage der Bibelübersetzungen

Hinweis: Für diese Notiz war das Suchbudget nach 15 Abfragen erschöpft; ERF Plus, Bibel TV, Jesus.de, Yeet, Alpha-App deutsch, CVJM/EC-Apps, SCM-Apps und App-Store-Rankings konnten nicht recherchiert werden. Alle Medien-/Kirchenangaben stammen aus Snippets.

### 3.1 Landschaft und Nutzung

| Angebot | Träger | Belegte Zahl (Quelle) |
|---|---|---|
| YouVersion „Bibel App" | Life.Church | Globale Meilensteine in deutschen Medien berichtet (200 Mio. → 400 Mio. → 800 Mio. → 1 Mrd.) ([jesus.de](https://www.jesus.de/nachrichten-themen/bibel-app-youversion-erreicht-800-millionen-downloads/); [idea.de](https://www.idea.de/artikel/eine-milliarde-downloads-bibel-app-youversion-feiert-rekord)); deutsche Übersetzungen u. a. Luther, Hfa, NeÜ, NGÜ, Schlachter ([App Store DE](https://apps.apple.com/de/app/bibel/id282935706)); keine DACH-Nutzerzahlen |
| Die-Bibel.de-App | Deutsche Bibelgesellschaft (DBG) | „over 100,000 downloads" Google Play ([Google Play](https://play.google.com/store/apps/details?id=de.dbg.bibel&hl=en-US)); Komplett-Neubau „after 9 years", Dezember 2025, mit Luther 2017, Einheitsübersetzung, BasisBibel, Gute Nachricht, kostenlos ([die-bibel.de/app](https://www.die-bibel.de/app); [nicolai-lemgo.de](https://www.nicolai-lemgo.de/b/neue-bibel-apps-erschienen-207621)); Release-Chronologie unsicher ([updatestar](https://die-bibel-de.updatestar.com/)) |
| Losungen-App | Herrnhuter Brüdergemeine | „99K+ downloads", 3,3/5 bei 500 Bewertungen (Drittanbieter-Schätzung, [mwm.ai](https://mwm.ai/apps/die-losungen/685358790)); Losungen seit 1731, über 50 Sprachen ([losungen.de](https://www.losungen.de/digital/app)) |
| KonApp | DBG im Auftrag der EKD | „over 100,000" Downloads, gut ein Viertel der EKD-Gemeinden registriert ([ekd.de](https://www.ekd.de/konapp-toppt-mit-nutzerzahlen-57173.htm)); 50.000 aktive Nutzer (3/2021) ([evangelisch.de](https://www.evangelisch.de/inhalte/183640/12-03-2021/50000-aktive-nutzer-konfirmanden-app-bleibt-kostenlos-bibelgesellschaft-ekd)) |
| Firm-App | Bonifatiuswerk (katholisch) | Inspiriert von der KonApp ([Bonifatiuswerk PDF](https://www.bonifatiuswerk.de/fileadmin/user_upload/bonifatiuswerk/aktionen/Firm/2023/Firm-Begleiter2023_web.pdf)) |
| ChurchTools | ChurchTools Innovations GmbH (Karlsruhe, 2015) | „163,000 users in the last 30 days as of August 2024" ([communiapp.de, Anbieterseite](https://communiapp.de/churchtools-vs-communi/)); 2.400–3.000 Gemeinden je nach Quelle ([church.tools](https://www.church.tools/)); EmK-Einführung ab Februar 2026 ([emk.de](https://www.emk.de/digitalisierung/aktuelles/einfuehrung-von-churchtools-ab-februar-2026)); Community Edition MIT-lizenziert ([churchtools_basic](https://github.com/churchtools/churchtools_basic)) |
| Communi | communi (Gemeinde-App-Baukasten) | „100,000 active users in 30 days as of February 2024", 350+ Communities ([communiapp.de](https://communiapp.de/churchtools-vs-communi/)); Angebot des BEFG für Baptistengemeinden ([befg.de](https://www.befg.de/angebote-fuer/gemeinden/communi-app)) |
| meinegemeinde.digital, Die GemeindeApp, Socie, DIVINE Connect | diverse | meinegemeinde.digital ca. 75 Gemeinden (Zuordnung unsicher, [Sonntagsblatt](https://www.sonntagsblatt.de/medientipps-gemeinde-apps-kirche-digitalekirche)) |
| DA-ZWISCHEN | Bistümer Speyer, Würzburg, Freiburg, Köln, Trier, Osnabrück, Magdeburg + eine Landeskirche | Migration von Messenger zu eigener App Ostern 2025, ca. 4.500 Begleitende ([domradio.de](https://www.domradio.de/artikel/christliche-community-zieht-mit-kommunikation-auf-app-um)) |
| Oikos | D-A-CH | Wirbt mit Community „für Christen mit und ohne Gemeindezugehörigkeit" ([oikos-projekt.org](https://oikos-projekt.org/)) |
| Hallow (deutsch) | Hallow Inc. | Deutschsprachiger Start Anfang 2024, Mönche des Stifts Heiligenkreuz ([katholisch.at](https://www.katholisch.at/aktuelles/146825/heiligenkreuzer-moenche-in-gebets-app-hallow-vertreten)); trotz „EU-Verbots"-Ankündigung Jan. 2025 weiterhin verfügbar (siehe 4.1) |
| Lectio 365 (deutsch) | 24-7 Prayer Deutschland/Schweiz | Deutsche Serien seit 2024 ([24-7prayer.de](https://24-7prayer.de/lectio-365-auf-deutsch/)) |
| Still | stillbible.app | Deutsche Schlaf-/Abendgebets-App; Anbieterseite räumt ein, dass „Worship-Musik und Studien-Werkzeuge fehlen" ([stillbible.app, Eigeninteresse](https://stillbible.app/de/compare/christliche-apps)) |

Befund: Die einzigen öffentlich belegten aktiven Nutzerbasen im DACH-Raum liegen im Gemeinde-Organisations-Segment; deutsche Bibel-Apps bewegen sich um ein bis zwei Größenordnungen unter YouVersion. Das Ökosystem ist konfessionell und institutionell segmentiert (EKD/DBG: KonApp, Die-Bibel.de, Losungen; katholisch: Firm-App, Einheitsübersetzung über Bibelwerk; Freikirchen: Communi/ChurchTools). Verbände adressieren vor allem die Organisationslücke, nicht die Andachts-/Jüngerschaftslücke. Nach der Pandemie ist die digitale Kirche in Deutschland vor allem „YouTube-Kirche" der Ortsgemeinde: 79 % der Gemeinden wünschen Online-Gottesdienste „bevorzugt von der eigenen Ortsgemeinde" (2020/21, [presse.ekir.de](https://presse.ekir.de/presse/DF839B2CED9F47FB8C89C97FE962B1F4/aktuelle-studien-zeigen-kirche-ist-digitaler-geworden)).

Kritik an deutschen Angeboten (belegbar nur strukturell): fehlende Content-APIs, restriktive Lizenzen, mittelmäßige Bewertung der Losungen-App (3,3/5), über neun Jahre technisch veraltete DBG-App bis zum Neubau 2025. Lesbare Nutzer-Rezensionen oder journalistische Kritik im Volltext lagen nicht vor.

### 3.2 Studienlage Deutschland

- **KMU 6** (EKD, 2023): 13 % der Bevölkerung hochreligiös, 56 % säkular; kirchenferne Religiosität sinkt stark bei 14–29-Jährigen; Jugendliche im Konfirmationsalter sind „bei guter Vermittlung" interessiert ([ekd.de](https://www.ekd.de/ergebnisse-der-6-kirchenmitgliedschaftsuntersuchung-80962.htm)).
- **Religionsmonitor 2023** (Bertelsmann, n = 4.363): 41 % der Jüngeren mit fester Austrittsabsicht ([Religionsmonitor kompakt](https://www.bertelsmann-stiftung.de/fileadmin/files/Projekte/51_Religionsmonitor/Religionsmoni_kompakt_final2.pdf)).
- **Shell-Jugendstudie 2024**: Nur noch die Hälfte der 12–25-Jährigen gehört einer großen Kirche an (2002: zwei Drittel); 18 % beten mindestens wöchentlich, 49 % nie (2002: 29 %); Kirchen mit geringstem Institutionenvertrauen (2,4/5) ([evangelisch.de](https://www.evangelisch.de/inhalte/235093/16-10-2024/shell-jugendstudie-2024-weniger-jugendliche-glauben-gott); [jesus.de](https://www.jesus.de/nachrichten-themen/jugendstudie-religion-verliert-fuer-christliche-jugendliche-an-bedeutung/)).
- **Corona-Erhebungen 2020/21** (midi/EKD-Umfeld): 78 % der Gemeinden hatten vorher keine digitalen Verkündigungsformate; 79 % wünschen Online-Gottesdienste weiterhin ([nordkirche.de](https://www.nordkirche.de/nachrichten/nachrichten-detail/nachricht/welche-digitalen-formate-der-verkuendigung-hat-die-corona-krise-hervorgebracht)).

Keine der Studien enthält (soweit aus Snippets erkennbar) Aussagen zur App-Nutzung. Inferenz: Der adressierbare Markt in Deutschland ist ein klar abgrenzbarer Nischenmarkt praktizierender Christen, kein Massenmarkt; Bildungs-/Begleit-Apps mit institutioneller Anbindung (KonApp) funktionieren als Kanal.

### 3.3 Lizenzlage deutscher Bibelübersetzungen

**Frei nutzbar (gemeinfrei bzw. frei lizenziert)** – alle sprachlich veraltet:

| Übersetzung | Status laut Quellen |
|---|---|
| Luther 1545, Luther 1912 | Public Domain ([4training.net](https://www.4training.net/German/de); [fidpa/bibelstudium-mcp](https://github.com/fidpa/bibelstudium-mcp)) |
| Elberfelder 1871, 1905 (1932 als Zefania-Modul) | Public Domain / CC0 ([Revisor01/ketiv](https://github.com/Revisor01/ketiv)) |
| Menge 1939 | Public Domain; „Menge 2020" (CLV) nicht |
| Textbibel 1906, Zürcher 1931 | Public Domain |
| Schlachter 1951 | **Widersprüchlich**: „CC BY 4.0 (Genfer Bibelgesellschaft / ebible.org)" mit Pflichtvermerk „© Genfer Bibelgesellschaft" ([fidpa/bibelstudium-mcp](https://github.com/fidpa/bibelstudium-mcp); [deckerweb/daily-scripture](https://github.com/deckerweb/daily-scripture)) vs. „nur nicht-kommerziell" ([ketiv](https://github.com/Revisor01/ketiv)) vs. „public domain in 2022" (ältere Snippets); Primärseite ebible.org war blockiert |
| Berean Standard Bible (englisch) | Public Domain seit 30.4.2023 ([Berean Bible Committee](https://berean.bible/committee.htm)) |
| NeÜ (Vanheiden) | Freigabe plausibel (Zefania-Modul laufend gepflegt, zuletzt 7.12.2025, [SourceForge](https://sourceforge.net/projects/zefania-sharp/files/Bibles/GER/Neue%20evangelistische%20Uebersetzung/)), aber **nicht durch Rechteinhaber-Seite belegt** |
| Offene Bibel | Freie Übersetzung (CC BY-SA laut Projektangabe, nicht verifiziert); Code-Repos seit 2018 inaktiv ([GitLab](https://gitlab.com/freie-bibel/free-offene-bibel-converter)) |

Freie Datenquellen: scrollmapper/bible_databases (MIT-Repo, deutsche Module u. a. GerSch, GerElb1905, GerMenge, GerLeoNA28; Lizenz pro Übersetzung nicht ausgewiesen, [GitHub](https://github.com/scrollmapper/bible_databases)), gratis-bible/bible (OSIS; Einträge wie „pat80" vor Nutzung auf Rechtsstatus prüfen, [GitHub](https://github.com/gratis-bible/bible/tree/master/de)), Zefania XML (814.000+ Downloads, keine Lizenzangaben pro Modul, [SourceForge](https://sourceforge.net/projects/zefania-sharp/)), getBible-API (GPL-3.0, [GitHub](https://github.com/getbible/v2)). Der meistgenutzte offene Bibeldatensatz auf GitHub (thiagobodruk/bible, 745 Stars) enthält für Deutsch nur Schlachter 1951 ([README](https://raw.githubusercontent.com/thiagobodruk/bible/master/README.md)); die Liste „awesome-bible-data" nennt keine einzige deutsche Übersetzung ([README](https://raw.githubusercontent.com/jcuenod/awesome-bible-data/main/README.md)). Warnung aus den Notizen: Das Repo „bibel/ELB2006" hostet die Elberfelder 2006 ohne Lizenzangabe und ist nicht als Datenquelle zu verwenden ([GitHub](https://github.com/bibel/ELB2006)).

**Geschützt (Lizenz erforderlich):** Luther 2017, BasisBibel, Gute Nachricht, Einheitsübersetzung 2016, Zürcher 2007, Elberfelder 2006, Schlachter 2000, NGÜ, Hoffnung für alle, Neues Leben, Menge 2020.

- **Deutsche Bibelgesellschaft**: „Die Publikationen der Deutschen Bibelgesellschaft unterliegen dem Urheberrechtsschutz, daher benötigen Sie für eine Verwendung grundsätzlich eine schriftliche Genehmigung. Dies gilt sowohl für Print- als auch digitale Veröffentlichungen." Ausnahme: kostenlose Veröffentlichungen einer Kirchengemeinde (Gemeindebrief, Website, Newsletter), sofern die Kirche ACK-Mitglied oder Gastmitglied ist. Ansprechpartner: Dr. Florian Voss (Lizenzen), Béatrice Gerhard (Abdruckanfragen) ([die-bibel.de/ueber-uns/lizenzen](https://www.die-bibel.de/ueber-uns/lizenzen)). Die DBG verkauft Digital- und Mehrplatzlizenzen ([shop.die-bibel.de](https://shop.die-bibel.de/Bibeln/Digitale-Bibeln/)). Entwicklerprojekte beziehen Luther 2017 per Scraping von die-bibel.de und deklarieren „for personal, devotional purposes" ([JXP1970/bibeltag](https://github.com/JXP1970/bibeltag)).
- **Schlachter 2000**: nur mit Erlaubnis der Genfer Bibelgesellschaft ([fidpa/bibelstudium-mcp](https://github.com/fidpa/bibelstudium-mcp)); auf Google Play existieren dennoch Drittanbieter-Apps mit unbekanntem Lizenzstatus.
- **BasisBibel**: nicht frei; Konverter-Tools verlangen den Kauf der EPUB ([Castlepool/basisbibel-to-markdown](https://github.com/Castlepool/basisbibel-to-markdown)).
- **Einheitsübersetzung**: liturgische Verwendung genehmigungspflichtig beim VDD ([dbk.de Merkblatt](https://www.dbk.de/fileadmin/redaktion/diverse_downloads/VDD_2021/2021_Merkblatt_Genehmigungspflicht-Abdruck-von-Textpassagen-aus-liturg.-Buechern.pdf)).
- **ERF Bibleserver**: „doesn't offer an API for the content of Bible verses, which is not possible due to license reasons"; nur eine Verlinkungs-API; „The license agreements with the Bible societies only provide for the use on the website bibleserver.com" ([bibleserver.com/webmasters](https://www.bibleserver.com/webmasters)). Open-Source-Scraper existieren seit Jahren ([mathisdt/bibleserver-scraper](https://github.com/mathisdt/bibleserver-scraper), 2026 archiviert).
- **Herrnhuter Losungen**: nicht-kommerziell, beide Verse zusammen, unverändert, Quellenvermerk „Evangelische Brüder-Unität – Herrnhuter Brüdergemeine", Daten nur von losungen.de, nur laufendes Jahr ± 1, Meldung an support@losungen.de; „in software that is offered for a fee, the Losungen may not be used" ([hesstobi/herrnhuter-losung-widget](https://github.com/hesstobi/herrnhuter-losung-widget); [Nutzungsbedingungen 2017 PDF](https://www.losungen.de/fileadmin/media-losungen/download/NUTZUNGSBEDINGUNGEN_Januar_2017.pdf)). Die Losungen eignen sich nur für ein kostenloses, werbefreies Produkt.
- **Liedtexte**: CCLI-Lizenzen sind Gemeindelizenzen, keine App-/Plattformlizenzen ([ccli.com](https://ccli.com/de/de)).
- **Internationale APIs**: API.Bible, ESV-API, NLT-API „Free for non-commercial usage with limitations" ([awesome-bible-developer-resources](https://raw.githubusercontent.com/biblenerd/awesome-bible-developer-resources/main/README.md)); YouVersion Platform mit App-Key (Nutzungsbedingungen nicht abrufbar, kommerzielle/Community-Nutzung offen).

Konkrete Lizenzgebühren für App-Nutzung wurden in keiner Quelle gefunden (Lücke). Inferenz: Die „fehlende moderne gemeinfreie Übersetzung" ist die zentrale deutsche Eintrittsbarriere, keine Nebensache. Eine deutsche App ohne Lizenzbudget muss (a) mit Texten vor 1940 arbeiten, (b) die YouVersion Platform einbetten (Abhängigkeit vom Marktführer im Community-Segment) oder (c) mit DBG/SCM/Genfer Bibelgesellschaft verhandeln.

---

## 4. Kritik

### 4.1 Datenschutz und Tracking

- **Buzzfeed News (Januar 2022, „Nothing Sacred: These Apps Reserve The Right To Sell Your Prayers")**: Pray.com erfasst Standort, Klicks und Posttexte, ergänzt um Daten von „data analytics providers and data brokers" (u. a. „religious affiliation, ethnicity, marital status, household size and income, political party affiliation") und teilt Personendaten inkl. Geräte-IDs „with third parties for commercial purposes"; die Data-Broker-Passage wurde erst am 22.12.2021 nach Buzzfeed-Anfrage eingefügt ([Buzzfeed News](https://www.buzzfeednews.com/article/emilybakerwhite/apps-selling-your-prayers)). Facebook-Targeting anhand von Modulen wie „Better Marriage", „Abundant Finance", „Releasing Anger" ([Inverse/Input](https://www.inverse.com/input/culture/prayer-apps-sell-data-to-tech-facebook-personalize-ads); [NPR](https://www.npr.org/2022/02/10/1079944694/what-we-can-learn-about-privacy-from-faith-based-apps)). Hallow antwortete, man habe Nutzerdaten „not yet" für Marketing geteilt, behalte sich dies aber vor ([Crux/CNS](https://cruxnow.com/cns/2022/04/prayer-apps-are-popular-but-users-cautioned-to-review-privacy-policies)).
- **Mozilla *Privacy Not Included (2022)**: Pray.com erhielt das Warnlabel („absolutely terrible privacy and security practices", Verdacht auf „a data harvesting business targeting Christians") ([Mozilla: Pray.com](https://www.mozillafoundation.org/en/privacynotincluded/praycom/)); Hallow schnitt als beste der fünf geprüften Gebets-Apps ab, sammelt aber Name, E-Mail, Telefon, Gender, IP, Gebetsminuten und nutzt Daten teilweise für Targeting ([Mozilla: Hallow](https://www.mozillafoundation.org/en/privacynotincluded/hallow/)).
- **YouVersion**: „accused of over-collecting data from its users since 2013"; 2019 verlangte die Android-Version Zugriff auf alle Kontakte und GPS-Standort ([Wikipedia](https://en.wikipedia.org/wiki/YouVersion)); YouVersion verkauft nach eigener Angabe keine Daten, nutzt aber Cookies/Tracking Dritter ([bible.com/privacy](https://www.bible.com/privacy)).
- **Hallow „EU-Rückzug" 2025**: Ende Januar 2025 verkündete CEO Alex Jones, die EU werde den Zugang wegen „over-regulation" religiöser Apps nicht mehr erlauben ([akref.ead.de](https://akref.ead.de/akref-nachrichten/2025/januar/31012025-europa-christliche-gebets-app-hallowverboten/)); Jones: „We are fully GDPR and DSA compliant … It has not been clear to me what specific regulation is being enforced" ([Aleteia](https://aleteia.org/2025/02/07/hallow-prayer-app-may-soon-be-forced-out-of-the-eu/)). Ein tatsächlicher Rückzug ist in keiner Quelle belegt; Gegenindizien: deutsche App-Store-Seite, hallow.com/de, Adventskampagne 2025, DFG-Projekt Passau. Regulatorischer Hintergrund: Art. 9 DSGVO (religiöse Überzeugungen als besondere Kategorie, nur mit ausdrücklicher Einwilligung), DSA seit Februar 2024.
- **ORF (Nov. 2025)**: Sozialethikerin Linda Kreuzer – KI-Tools in Gebets-Apps nutzten Targeting-Cookies für Persönlichkeitsprofile ([religion.ORF.at](https://religion.orf.at/stories/3232866/)). Theologe Johannes Hoff (Innsbruck) schlägt ein vatikanisches Prüfsiegel für Apps vor (Datensicherheit, Verhaltensmanipulation) ([katholisch.at](https://www.katholisch.at/aktuelles/155414/theologe-schlaegt-vatikanisches-pruefsiegel-fuer-katholische-apps-vor)).
- **Kirchlicher Datenschutz Deutschland**: EKD-Datenschutzbeauftragter Michael Jacob (2018): „WhatsApp geht überhaupt nicht" für dienstliche Nutzung ([evangelisch.de](https://www.evangelisch.de/inhalte/150140/23-05-2018/der-ekd-datenschutzbeauftragte-michael-jacob-ueber-die-dsgvo-und-die-eu-verordnung)); freigegeben sind dienstliche Messenger wie Threema Work ([ensecur](https://www.ensecur.de/datenschutzkonformer-einsatz-von-messengern-in-kirchlichen-evangelischen-stellen/)); die katholischen Diözesandatenschützer untersagten dienstliche Messenger-Nutzung (später relativiert) ([datenschutz-am-bodensee.com](https://datenschutz-am-bodensee.com/zum-einsatz-von-whatsapp-als-messengerdienst-in-der-katholischen-kirche/)).

Konkrete Tracker-Anzahlen und SDK-Namen für einzelne Apps sind nicht belegt (Exodus-Privacy-Berichte blockiert).

### 4.2 Kommerzialisierung

- VC-Druck: Hallow ca. 157 Mio. USD, Glorify 80–85 Mio. USD, Pray.com 34–38 Mio. USD, Bible Chat 14 Mio. USD (Quellen in 2.2).
- „Money Grab"-Vorwürfe gegen Hallow wegen Abo-Paywall ([IBTimes UK](https://www.ibtimes.co.uk/hallow-app-controversy-why-some-users-call-it-money-grab-why-its-banned-some-countries-1738240)); Kirchenzeitung Linz: „Das Geschäft mit dem Amen" ([kirchenzeitung.at](https://www.kirchenzeitung.at/site/kirche/weltkirche/das-geschaeft-mit-dem-amen-die-hallow-app)); America Magazine: „praying with your smartphone has its limits" ([America](https://www.americamagazine.org/faith/2021/11/24/hallow-prayer-app-241910/)).
- Abo-Tricks: Glorify „lures users with $8/month pricing but eventually charges $97", Kündigung nur per Formular, zeitweise deaktiviert ([Trustpilot](https://www.trustpilot.com/review/glorify.com)); Logos-Abo 2024 mit „significant loss in value", „billing confusion, hard-to-cancel subscriptions" ([Logos Community](https://community.logos.com/forums/topic/208086-official-update-for-faithlife-connect-subscribers/)); Dwell ohne Free-Tier.
- Werbung: Bible Gateway mit „horrific distracting ads that blink, flash, move across the screen", Vollbild-Ads ohne Schließen-Button ([Trustpilot](https://www.trustpilot.com/review/www.biblegateway.com)).
- Promi-Marketing mit Fehlgriffen: Liam Neeson (Advent 2023, Jones nannte die Partnerschaft Dez. 2024 einen „mistake", [NCRegister](https://www.ncregister.com/news/hallow-apps-alex-jones-calls-neeson-partnership-mistake)); Russell Brand (Trennung April 2025 nach Anklage, [America](https://www.americamagazine.org/faith/2025/04/08/hallow-app-russell-brand-rape-charges-250337/)); Gwen Stefani/Chris Pratt (Advent 2025, [katholisch.de](https://katholisch.de/artikel/66329-kritik-an-adventskampagne-promis-unterstuetzen-hallow-app)). ORF: „Christfluencer" ohne theologische Ausbildung und Qualitätskontrolle.
- Gegenstimmen: Johannes Hartl (Herder) gegen „Kontaktschuld"-Vorwürfe ([herder.de](https://www.herder.de/communio/kolumnen/hartl-aber-herzlich/hallow-app-und-christliche-influencer-in-der-kritik-kontaktschuld/)); Die Tagespost: „Kreuzigung einer katholischen App" ([Die Tagespost](https://www.die-tagespost.de/kultur/medien/kreuzigung-einer-katholischen-app-art-264609)).

### 4.3 Gamification und Streaks

- Universität Passau (DFG-Projekt ab Oktober 2026, ca. 515.000 €, Theologe Markus Weißer): Hallow arbeite mit Gebetszielen, Routinen und „Streaks", mache religiöse Praxis „digital messbar" und könne „Selbstoptimierung und Leistungsorientierung" ins Gebetsleben tragen ([evangelisch.de](https://www.evangelisch.de/inhalte/259533/29-09-2026/passauer-theologen-untersuchen-ki-gebets-app-hallow); [domradio.de](https://www.domradio.de/artikel/passauer-theologen-untersuchen-ki-gebets-app-hallow)).
- YouVersion: Badges für abgeschlossene Pläne, Markierungen, Notizen, geteilte Verse, ganze Bibel; Lesestreaks ([bibleinyear.com, sekundär](https://www.bibleinyear.com/blog/youversion-bible-app)); Startseite „slowly become a content feed … competing with the Bible itself" ([learnofchrist, sekundär](https://learnofchrist.com/resources/youversion)).
- Die Selbstoptimierungs-Metapher wird auch von Befürwortern genutzt: Die Tagespost nennt Hallow „Fitness-App für Geist und Seele" ([Die Tagespost](https://www.die-tagespost.de/kirche/aktuell/hallow-app-fitness-app-fuer-geist-und-seele-art-236709)).
- Zugleich sind zeitlich begrenzte Challenges (Pray40, 30-Day Bible Challenge mit 2,6 Mio. Teilnehmern im November 2025, [YouVersion News](https://www.youversion.com/news/youversion-announces-2025-verse-of-the-year)) die stärksten messbaren Engagement-Treiber. Eine empirische Studie zur Wirkung von Streaks auf Glaubenspraxis existiert noch nicht (Passau beginnt erst).

### 4.4 Konsum statt Gemeinschaft

- Christianity Today: „more communication but not more community" ([CT](https://www.christianitytoday.com/2025/11/christianity-at-a-crossroads-hempton/)); „Church in a Time of Brain Rot" ([CT](https://www.christianitytoday.com/2025/07/church-brain-rot-nicholas-carr-superbloom-ivan-illich-community/)); zu Glorify: „whether there's danger in depending on an app for spiritual growth" ([CT](https://www.christianitytoday.com/2025/03/devotion-prayer-app-glorify-tim-timberlake/)).
- UnHerd: „You won't find God on your iPhone" ([UnHerd](https://unherd.com/2025/05/you-wont-find-god-on-your-iphone/)). Hoff mit Augustinus: „wer das Bild seiner selbst anbetet, verfällt dem Götzendienst".
- Daten: 54 % der Gen Z bevorzugen Präsenzbeziehungen; 40 % der Christen würden eine rein digitale Gemeinde nicht besuchen; bei Einsamkeit bevorzugen Amerikaner physische Orte ([Subsplash/Barna](https://www.subsplash.com/blog/barna-subsplash-webinar-shaping-the-future-of-digital-discipleship)).
- Jüngerschafts-Apps sind content-first; Community ist Mittel zur Content-Nutzung (Watch Together), nicht Selbstzweck.

### 4.5 Politische Vereinnahmung

- katholisch.de (2024): Verdacht, Hallow könnte dazu beigetragen haben, Katholiken zu Trump-Wählern zu machen; Thiel als „eifriger Trump-Unterstützer" ([katholisch.de](https://katholisch.de/artikel/56435-welche-rolle-spielt-die-gebetsapp-hallow-bei-den-us-wahlen)); Massimo Faggioli: „problematische Vermischung von Religion, Politik und Kommerzialisierung"; Vorwurf einer „neuen Form konservativer, anti-woker Frömmigkeit" ([katholisch.de](https://katholisch.de/artikel/66536-gebetsapp-hallow-zwischen-glauben-geld-und-macht)); hpd.de: „ideologische Beeinflussung im frommen Gewand" ([hpd.de](https://hpd.de/artikel/besser-beten-hallow-app-23027)); Kontrast.at: „Rechte investieren Millionen" ([kontrast.at](https://kontrast.at/katholische-gebets-app-hallow-stars/)).
- Tucker-Carlson-Sponsoring: Am 18.2.2026 kündigte Carlson Hallow als Sponsor seiner Show für die Fastenzeit an; Folge: Boykottaufrufe und Abo-Kündigungen, aber auch Zuspruch; zusätzlich Kritik an der Verschiebung vom katholischen zum allgemein-christlichen Branding ([RNS](https://religionnews.com/2026/02/23/prayer-app-hallow-faces-backlash-over-lenten-partnership-with-tucker-carlson/); [katholisch.de](https://katholisch.de/artikel/67404-gebets-app-hallow-erneut-in-kritik-wegen-umstrittenem-moderator)). Quantitative Daten zur Kündigungswelle fehlen. Die Angabe eines Hallow-Spots in einer GOP-Debatte 2023 ist nur in einer Fox-News-Quelle belegt ([Fox News](https://www.foxnews.com/lifestyle/hallow-prayer-app-accomplished-goal-gop-debate-company-pray-me-quick.amp)).
- Gab als Reputationsrisiko für das Label „christlich" ([Forward](https://forward.com/culture/521336/gab-gabpay-paypal-andrew-torba-christian-nationalist/)).
- Hallow wird von zwei Seiten kritisiert: progressiv/säkular (Thiel/Vance, Carlson) und traditionalistisch-katholisch (Neeson, Brand, Verwässerung) – Hinweis auf eine riskante Markenpositionierung zwischen Reichweite und Kernzielgruppe (Inferenz).

### 4.6 KI

- Gruenewald (YouVersion): KI zitiert die Bibel in 15–60 % der Fälle falsch; bewusster Verzicht auf Theologie-Chatbot (Quellen in 2.1).
- Bible-Society-Studie „AI, Bible Apps and Theological Bias" (ChatGPT, Bible GPT, Cross Talk, Biblia Chat, Bible Chat): Antworten „regularly framed one interpretive approach as definitive, with little reference to historical, sacramental or tradition-based readings"; Risiko „hallucinated verse references"; KI-Tempo verdränge „deeper engagement with the biblical text" ([Christian Today](https://www.christiantoday.com/news/concerns-raised-over-theological-bias-in-ai-bible-chatbots)).
- Verhoef (North-West University, 2025, explorativ): vier von fünf Jesus-Chatbots behaupten, Jesus zu sein; Theologie werde „not by Scripture, not by a confessional tradition, not by a pastor or theologian, but by the algorithm" geformt; „AI is driven by financial forces that are difficult to oppose" ([LitNet](https://www.litnet.co.za/artificial-intelligence-jesus-chatbots-challenge-for-theology-an-exploratory-study/); [The Conversation](https://theconversation.com/jesus-chatbots-are-on-the-rise-a-philosopher-puts-them-to-the-test-262524)). Peer-Review-Status nicht ermittelbar.
- Theologische Kritik an „Text With Jesus": „itching ears of 21st century users" (James Spencer, Moody), „cheapening the sacred" (CatholicVote) ([Fox Business](https://www.foxbusiness.com/technology/text-jesus-app-draws-thousands-creator-says-ai-can-help-people-explore-scripture); [CatholicVote](https://catholicvote.org/text-with-jesus-ai-chatbot-app-draws-criticism-including-for-option-to-message-with-satan/)).
- Open-Source-Signal: AndBible führte 2026 LLM-Funktionen ein; Nutzer forderten daraufhin „clean builds with local-only features (no LLM/AI features)" (Issue #3808, meistdiskutiertes KI-Issue) ([AndBible #3808](https://github.com/AndBible/and-bible/issues/3808)).
- Zwei Paradigmen: Persona-Chatbots (kommerziell erfolgreich im Kleinen, theologisch breit abgelehnt) vs. quellengebundene Retrieval-KI ohne Persona mit Zitaten (Logos Study Assistant, Magisterium AI/Hallow AI). Mindeststandards laut Quellen: Kennzeichnung, Quellenbindung, kein Jesus-Persona, keine Nutzung von Gebetsinhalten zum Training, Opt-out.

### 4.7 UX und Technik

- YouVersion: „barrage of reminders, daily verses, community activity updates, and challenges … transforming a tool designed for reflection into a source of digital distraction" ([AWC Guide, sekundär, geringe Reputation](https://awc.airforce.mil.ng/problems-with-youversion-bible-app/)); Notizen „closer to a verse highlighter than a real notebook"; Offline nur per Einzeldownload, manche Lizenzen gar nicht offline ([learnofchrist, sekundär](https://learnofchrist.com/resources/youversion)).
- Olive Tree: Bugs; Logos: „slow performance, long load times" ([Capterra](https://www.capterra.com/p/275095/Logos/reviews/)); Church Center: keine Nachrichtensuche, Unread-Bug; Hosanna: Sleep-Timer fehlt; Hallow: KI-Modul nicht deaktivierbar, Family-Plan nur über Website.
- Governance-Risiken: Logos-Umbau 2025, Accordance ohne Roadmap, STEP Android entfernt, Bible.is-Zwangsmigration; Nutzer-Lock-in in Bibliotheken ist ein Kritikpunkt an sich.
- Nutzerzufriedenheit und Expertenkritik fallen auseinander: Glorify 4,9/5 auf Google Play, Text With Jesus 4,7 Sterne bei gleichzeitig scharfer Kritik ([mwm.ai](https://mwm.ai/apps/glorify-devotional-prayer/1490587079)).

### 4.8 Kinder- und Jugendschutz

- YouVersion wird als „shadow social media" beschrieben, „linking younger users with strangers sharing illicit content"; Community-Funktionen „enable friend requests, messaging, and photo sharing … strangers could contact minors without oversight" ([Hope 103.2](https://hope1032.com.au/parenting/youversion-bible-app-child-safety-vulnerability-exposed/)); keine YouVersion-Stellungnahme gefunden.
- Messenger: DMs unsichtbar für Moderatoren; 1:1-Kanäle Erwachsene/Minderjährige als Risikosetting; WhatsApp-Gruppen mit Minderjährigen „unsafe" (Quellen in 2.3).

Zusammenfassung der Kritikverteilung: Gebets-Apps werden an ihrer Haltung gemessen (Geld, Politik, Konfession), Bibel-Apps an ihrer Handwerklichkeit (Text, Werkzeuge, Zuverlässigkeit, Werbefreiheit), Community-Apps an Sicherheit und Dichte. Eine Kombi-App erbt alle drei Kritikfelder.

---

## 5. Belegte Bedürfnisse und Lücken

**Bedürfnisse (Studien, USA):** Einsamkeit (Gen Z 29 %), Beziehung vor Predigt (57 %), „like family"-Kleingruppen (68 % vs. 28 %), fehlende Begleitung (36 % „not being discipled"), Unkenntnis über Angebote (22 % wissen nicht, ob ihre Gemeinde Kleingruppen hat), Menschen ohne Gemeinde (10 % „Love Jesus but not the Church"), Präferenz für Präsenz (54 %/40 %). Deutschland: Interesse im Konfirmationsalter „bei guter Vermittlung" (KMU 6), KonApp mit ≥ 100.000 Downloads als funktionierendes institutionelles Beispiel; die Mehrheit der 12–25-Jährigen betet nie (49 %).

**Bedürfnisse (Produktebene, Issue-Tracker der größten Open-Source-Bibel-App AndBible, 815 Stars, 1.062 offene Issues):** Einstieg/Orientierung (Tutorial-Wunsch #1239), Gewohnheit/Erinnerung (#184 seit 2018 offen, Label „Sponsor me!"; #3590 Streak-Benachrichtigungen 2026), sichtbarer Fortschritt (#252), Sync von Notizen/Lesezeichen (#154, 19 Kommentare), bessere Notizen (#188), Diskretion (#1609 „Logo with Non-religious Symbols", 49 Kommentare, meistdiskutiertes Wunsch-Issue), Audio-Qualität (#1602) ([AndBible Issues](https://github.com/AndBible/and-bible/issues/1239)). Inferenz: eine Ressourcen-, keine Erkenntnislücke.

**Lücken (verifiziert):**

1. **Keine Kombination aus Bibel + übergemeindlicher lokaler Gemeinschaft + Gebet/Jüngerschaft + werbefrei/datensparsam + Open Source.** Kommerziell existieren die Bausteine getrennt (YouVersion: Bibel + Freundes-Community; Hallow: Gebet, bezahlt; Gemeinde-Apps: nur eigene Gemeinde; christliche Social Networks: gescheitert). Open Source: Die kuratierten Listen „christian-projects" (126 Stars) und „awesome-catholic" (346 Stars) führen weder Discipleship-, Mentoring-, Gebetspartner- noch Accountability-Apps; „No German-language projects"; OneBody (Gemeinde-Social-Software) ist archiviert ([christian-projects README](https://raw.githubusercontent.com/mattrob33/christian-projects/main/README.md); [awesome-catholic README](https://raw.githubusercontent.com/servusdei2018/awesome-catholic/master/README.md)). GitHub-Suche „christian social network": kein relevantes Projekt ([GitHub-API](https://api.github.com/search/repositories?q=christian+social+network&sort=stars&order=desc&per_page=20)). Die bestbewerteten Open-Source-Gebets-Apps sind muslimisch (al-azan: „Privacy focused ad-free open-source", 279 Stars); die erste christliche liegt bei 56 Stars ([GitHub-API](https://api.github.com/search/repositories?q=prayer+app&sort=stars&order=desc&per_page=20)).
2. **Keine freie moderne deutsche Übersetzung** (siehe 3.3); die Offene Bibel ist seit 2018 code-seitig inaktiv.
3. **Keine deutschsprachige Community-/Jüngerschafts-App**: 34 deutsche Hobby-Repos „bibel app" mit 0 Stars, viele 2026 angelegt ([GitHub-API](https://api.github.com/search/repositories?q=bibel+app&sort=stars&order=desc&per_page=25)); laut Notizen auch keine übergemeindliche kommerzielle App. Verbände adressieren Organisation (ChurchTools, Communi), nicht Jüngerschaft.
4. **Keine Brücke zwischen Content-Erlebnis und dauerhafter lokaler Beziehung**; ChMS sind mandantengebunden, YouVersion ist global ohne Ort.
5. **Kein ökumenisches, werbefreies, spendenfinanziertes Gebetsangebot** mit Hallow-ähnlicher Produktqualität; das spendenfinanzierte Segment ist fast ausschließlich evangelisch/überkonfessionell, Hallow katholisch und VC-finanziert.
6. **Jugend-Angebote** existieren in Deutschland nur institutionell angebunden (KonApp, Firm-App), getrennt nach Konfession.

**Was nachweislich nicht funktioniert:** (1) Social Network „für Christen" als Selbstzweck (Netzwerkeffekt fehlt, 20 Jahre Schließungen); (2) Freiwilligen-Übersetzungsprojekte ohne institutionelle Trägerschaft (Offene Bibel); (3) Monetarisierung über Abo-Tricks/Werbung in einem Vertrauensprodukt; (4) KI-Funktionen ohne Opt-out (AndBible #3808); (5) Feature-Maximalismus: 2026 entstehen zahlreiche KI-generierte „Super-Apps" (Bibel + Gebet + Community + Events + Spiele + KI) mit riesigen Issue-Threads und 0 Nutzern ([GitHub-API](https://api.github.com/search/issues?q=%22prayer+request%22+app+feature&sort=comments&order=desc&per_page=20)). Inferenz: Die Lücke bleibt nicht wegen fehlender Features bestehen, sondern wegen Vertrauen, Inhalte-Lizenzen und Netzwerkeffekten.

**Warum die Lücke besteht (vier Mechanismen):** Lizenzrechte (moderne Übersetzungen nicht frei), Finanzierung (OSS-Features jahrelang „Sponsor me!", kommerzielle Anbieter unter VC-/Abo-Druck), Netzwerkeffekte (Community ohne kritische Masse scheitert, Gemeinde-Apps lokal abgeschottet), Theologie/Konfession (Ökosysteme segmentiert).

**Trends 2024–2026:** KI verschiebt sich von „Chatbot in der App" zu „verlässlicher Bibeltext für Agenten" (YouVersion-Benchmark, Platform-Skills, MCP-Server) ([platform-skills README](https://raw.githubusercontent.com/youversion/platform-skills/main/README.md)); Rückkehr zur Präsenz (Lifeway/Barna); Audio (Dwell, Lectio 365); AndBible startete 2026 eine iOS-Adaption; ChurchApps veröffentlicht frei lizenzierte Gemeinde-Inhalte (WorshipCommons). Unverifiziert (Vorwissen der Notizen, vor Verwendung prüfen): „The Quiet Revival" (Bible Society UK, April 2025) mit Anstieg des monatlichen Kirchgangs der 18–24-Jährigen in England/Wales von 4 % auf 16 %; Anstieg gedruckter Bibelverkäufe in den USA 2024 um ca. 22 %.

---

## 6. Die App, die fehlt: Produktkonzept

### 6.1 Positionierung

Eine werbefreie, datensparsame, konfessionell transparente (ökumenisch offene) deutschsprachige Web-App, die drei Dinge verbindet, die heute getrennt sind: **Bibel lesen und verstehen**, **miteinander beten** und **kleine, moderierte Gemeinschaft, die in Präsenzbegegnung mündet**, offen für Menschen mit und ohne Gemeinde. Kein soziales Netzwerk, kein Content-Abo, keine Gemeindeverwaltung. Das Produkt ist die Negativfolie der dokumentierten Kritik: ohne Werbung und Tracking (Pray.com, Bible Gateway), ohne Abo-Paywall auf den Bibeltext (Dwell, Glorify, Logos), ohne Streak-Druck (Passau-Kritik), ohne Promi- oder Politpartnerschaften (Hallow), ohne generative Theologie (YouVersion-Verzicht, Verhoef), ohne offenen Feed (YouVersion-Clutter, Kinderschutz). Leitbild: Digital als Brücke in physische Gemeinschaft, nicht als Ersatz (Barna 54 %/40 %, Lifeway-Präsenzanstieg).

### 6.2 Zielgruppe

Primär: praktizierende deutschsprachige Christen zwischen etwa 18 und 45, die (a) ohne Gemeinde oder zwischen Gemeinden sind (Zugezogene, Studierende, Menschen nach Gemeindewechsel; US-Analogie „Love Jesus but not the Church" 10 %), oder (b) in einer Gemeinde sind, aber keine Kleingruppe haben bzw. nicht wissen, ob es eine gibt (22 % laut Barna), oder (c) einen Hauskreis leiten und ein datenschutzkonformes Werkzeug jenseits von WhatsApp suchen (EKD: „WhatsApp geht überhaupt nicht"). Sekundär: Gemeinden und Jugendwerke als Träger von Gruppen (ohne Mandantenlogik). Nicht Zielgruppe in Phase 1: Minderjährige ohne Begleitstruktur (Safeguarding-Aufwand), Profi-Bibelstudium (Logos/Accordance), Gemeindeverwaltung (ChurchTools). Der deutsche Markt ist ein Nischenmarkt (Shell 2024: 18 % der 12–25-Jährigen beten wöchentlich; KMU 6: 13 % hochreligiös); die Produktmetrik ist Beziehungstiefe (wiederkehrende Gruppenkontakte, Gebet füreinander), nicht Reichweite.

### 6.3 Kernfunktionen (14) mit Begründung

1. **Bibelreader mit gemeinfreier Basis und mindestens einer modernen deutschen Übersetzung.** Begründung: Sprachlich veraltete Texte (vor 1940) sind die Hürde genau für die Zielgruppe; alle modernen Übersetzungen sind lizenzpflichtig (3.3). Weg: Lizenzverhandlung mit DBG (BasisBibel oder Luther 2017; Ansprechpartner Dr. Florian Voss) oder Genfer Bibelgesellschaft (Schlachter 2000/NGÜ), ersatzweise NeÜ nach Klärung mit dem Rechteinhaber, als Fallback Einbettung der YouVersion Platform (Abhängigkeit, siehe Risiken).
2. **Parallelansicht, Volltextsuche, Querverweise, einfache Wortstudien.** Begründung: Lücke „kostenlose Urtext-Werkzeuge (BLB/STEP-Niveau) mit moderner UI und Community" (2.1); YouVersion hat „no Strong's concordance, no word studies".
3. **Ruhiger Tagesrhythmus (Tagesvers oder Losungen, kurzer Impuls, optional Morgen/Abend) mit Opt-in-Erinnerung.** Begründung: Lectio-365-Muster (330.000 MAU, spendenfinanziert); AndBible-Wunsch #184 (tägliche Erinnerung); Gegenmodell zur YouVersion-Benachrichtigungsflut. Losungen nur, wenn das Produkt dauerhaft kostenlos und werbefrei bleibt (Nutzungsbedingungen).
4. **Lesepläne ohne Streaks, Badges oder Ranglisten, aber mit sichtbarem Fortschritt und Pausenfähigkeit.** Begründung: Passau-Kritik „Selbstoptimierung und Leistungsorientierung"; zugleich AndBible-Wunsch #252 (Fortschritt sichtbar) und YouVersion-Daten (3 Mio. Jahrespläne am Neujahrstag 2025).
5. **Gemeinsame Lesepläne in Gruppen mit Diskussion am Tagesabschnitt.** Begründung: „Plans with Friends" ist das einzige breit genutzte Community-Muster in Bibel-Apps (seit 2017, Limit 300, Kleingruppen-Fokus); Barna: Kleingruppen „like family" verdoppeln Gemeinschaftserleben.
6. **Gebetswand mit Sichtbarkeitsstufen (nur ich / Gruppe / alle), Anonymität, „Ich bete mit", Ermutigungen, erhörte Gebete.** Begründung: YouVersion-Gebetsfunktion mit 1 Mio. Gebeten in der ersten Woche und +46 % Engagement 2024; Buzzfeed/Mozilla zeigen, dass Gebetsdaten die sensibelsten Daten sind, daher Art.-9-konforme Sichtbarkeit und keine Weitergabe.
7. **Kleine, geschlossene Gruppen (online und vor Ort) mit Rollen, Übergabe der Leitung und Beitrittsregeln.** Begründung: Genutzte Community-Mechaniken sind „bounded"; WhatsApp-Problem „orphaned chat threads" und Nummern-Offenlegung; Subsplash/ChurchTools-Standard (Rollen, Filter) als Mindestmaß.
8. **Lokale Brücke: Gruppen und Treffen in der Nähe finden, Verabredungen mit Zu-/Absage, Kalender-Export.** Begründung: Die zentrale strukturelle Lücke (ChMS mandantengebunden, YouVersion ohne Ort, 22 % kennen Kleingruppenangebote nicht); Präsenzpräferenz der Daten; Oikos adressiert dieselbe Gruppe „mit und ohne Gemeindezugehörigkeit".
9. **Zeitlich begrenzte gemeinsame Zeiten (z. B. 30 Tage, Advent, Passionszeit) ohne Rangliste.** Begründung: Pray40 (ca. 2 Mio. Teilnehmer 2025) und die 30-Day Bible Challenge (2,6 Mio.) sind die stärksten belegten Engagement-Treiber; Hallows Downloads vervielfachen sich am Aschermittwoch um das 25-fache.
10. **Gebetspartner- und Begleitungs-Signal (Opt-in, 1:1 nur zwischen Erwachsenen, mit Beendigung und Meldung).** Begründung: 36 % „not being discipled"; Open-Source-Landschaft ohne Discipleship-/Mentoring-/Accountability-Apps; Safeguarding-Regel „keine unmoderierten 1:1-Kanäle Erwachsene/Minderjährige".
11. **Notizen, Markierungen, Lesezeichen, privates Tagebuch, Lernverse, mit Export und Geräte-Sync.** Begründung: AndBible #154/#188 (Sync, bessere Notizen, jahrelang offen); YouVersion-Notizen „closer to a verse highlighter than a real notebook"; Lock-in-Kritik an Logos/Olive Tree spricht für Export.
12. **Moderation und Safeguarding: Meldungen, Rollen, Sperren, Audit-Protokoll, Altersregeln, automatische Wort-/Bildfilter.** Begründung: ChristianChirp (über 50 Angriffe im ersten Monat), YouVersion-„shadow social media"-Kritik, Diocese-of-Sheffield-Leitlinien, Subsplash-Filter als Marktstandard.
13. **Offline-Fähigkeit (PWA) und Diskretionsoption (neutrales Icon/Name, Pseudonym).** Begründung: YouVersion-Offline-Kritik; AndBible #1609 (49 Kommentare) als meistdiskutierter Nutzerwunsch.
14. **Datenkonto: Export, Löschung, Sitzungsverwaltung, keine Dritt-Tracker, Hosting in der EU.** Begründung: Art. 9 DSGVO, Mozilla-Kriterien, kirchliche Datenschutzgesetze (DSG-EKD/KDG) als Erwartungsmaßstab und Verkaufsargument gegenüber Gemeinden.

Optional, erst nach Phase 1 und nur mit Opt-out: eine **zitierende Bibelsuche** (Retrieval über den lizenzierten Text, keine generierten Antworten, keine Persona). Begründung: Nutzer wollen Fragen stellen (Bible Chat 10–25 Mio.), aber 15–60 % Fehlzitate, Bias-Studie und AndBible #3808 verlangen Quellenbindung und KI-freien Modus.

### 6.4 Bewusste Nicht-Funktionen

- Kein offener, algorithmischer Feed und keine öffentlichen Reichweitenmetriken (Follower-Zahlen prominent, Likes als Währung): Scheitern aller christlichen Social Networks, YouVersion-Clutter, Kinderschutz.
- Keine Werbung, kein Werbe-Targeting, keine Social-Login-/Analytics-SDKs Dritter.
- Kein Abo auf den Bibeltext, keine Paywall-Stufen, keine Free-Trials mit Kreditkarte.
- Keine Streaks, Badges, Ranglisten, keine „Gebetsminuten"-Statistiken.
- Kein Jesus-/Heiligen-Chatbot, keine KI-generierten Gebete oder Andachten, kein Training auf Nutzerinhalten.
- Keine Promi-, Influencer- oder Polit-Partnerschaften; konfessionelle Transparenz statt Vereinnahmung.
- Kein Livestream-/Online-Gottesdienst als Ersatz für die Ortsgemeinde (79 % der deutschen Gemeinden wollen das selbst anbieten).
- Keine Gemeindeverwaltung (Spenden, Check-in, Finanzen, Ressourcen): ChurchTools/Communi besetzen das Feld; ggf. später Schnittstelle zu ChurchTools (237 Repos, offizieller JS-Client).
- Keine Dating-Funktion (eigenes Segment: Christ sucht Christ, Eden).
- Keine Push-Flut: alle Benachrichtigungen Opt-in und bündelbar.

### 6.5 Geschäftsmodell

Spendenfinanziert und werbefrei, getragen von einem gemeinnützigen Verein oder einer gGmbH; Vorbilder: Lectio 365 („funded entirely by donations", 330.000 MAU), BibleProject (50.000 Unterstützer, 26,7 Mio. USD), Blue Letter Bible (501c3), YouVersion (~40.000 Spender). Ergänzend: Gemeinde- oder Werks-Patenschaften (Verbände wie BEFG, FeG, EmK finanzieren bereits Gemeinde-Apps), optional „sponsored membership" nach dem Glorify-Muster, falls je kostenpflichtige Zusatzinhalte entstehen. Keine VC-Finanzierung (Wachstumsdruck ist der dokumentierte Treiber der Kritik). Der größte Kostenblock ist absehbar die Übersetzungslizenz (Gebühren nicht öffentlich; individuell zu verhandeln). Die Losungen-Bedingungen (nicht-kommerziell) schließen jede Bezahl-Variante aus, solange sie integriert sind. Realistische Reichweite: Lectio 365 liegt trotz Spendenmodell um Faktor 10–20 unter Hallow; für den deutschen Nischenmarkt sind ChurchTools (163.000) und KonApp (100.000) die Referenzgrößen.

### 6.6 Datenschutz-Prinzipien

1. Religiöse Daten sind Art.-9-Daten: ausdrückliche, dokumentierte Einwilligung bei Registrierung und je Funktion (Gebet, Gruppen, Standort).
2. Datenminimierung: kein Standort-Tracking (Ort nur als freiwillige Angabe für die lokale Suche, grob), keine Kontakte, kein Werbe-Profil.
3. Gebets- und Tagebuchinhalte werden nie ausgewertet, weitergegeben oder für Training genutzt; Sichtbarkeit standardmäßig privat.
4. Keine Dritt-Tracker, keine externen Analytics-SDKs; eigene Authentifizierung; Hosting in der EU.
5. Export und Löschung (Anonymisierung) für alle Nutzerdaten; Gruppen bleiben beim Weggang der Leitung übergebbar.
6. Pseudonymität und neutrale Darstellung als Option (Diskretion).
7. Transparenzbericht und offener Quellcode als Prüfbarkeit (Hoffs „Prüfsiegel"-Idee praktisch vorweggenommen); bei Wachstum DSA-Pflichten (Nutzerzahlberichte, Meldewege) einplanen.
8. Maßstab für Gemeinden: DSG-EKD/KDG-Konformität dokumentieren, da WhatsApp dienstlich untersagt ist.

### 6.7 Lizenzlage für das Konzept

- Sofort nutzbar: Luther 1912/1545, Elberfelder 1905/1871, Menge 1939, Textbibel 1906, Zürcher 1931; Berean Standard Bible (englisch, Public Domain); Schlachter 1951 nur mit Vermerk „© Genfer Bibelgesellschaft" und nach Klärung des widersprüchlichen Status (CC BY 4.0 vs. nicht-kommerziell).
- Zu klären: NeÜ (Rechteinhaber-Bedingungen nicht belegt), Offene Bibel (Lizenz CC BY-SA nicht verifiziert, Projekt inaktiv), Volxbibel (Status ungeklärt).
- Zu verhandeln: Luther 2017/BasisBibel (DBG), Schlachter 2000/NGÜ (Genfer Bibelgesellschaft), Hfa (Fontis), Elberfelder 2006/Neues Leben (SCM), Einheitsübersetzung (KBW/VDD). Rechteinhaber-Zuordnungen stammen aus Vorwissen der Notizen und sind zu bestätigen.
- Nicht verwenden: ungeklärte GitHub-Spiegel moderner Texte (z. B. bibel/ELB2006), Scraping von bibleserver.com oder die-bibel.de.
- Losungen: nur bei dauerhaft kostenlosem, werbefreiem Betrieb, mit beiden Versen, unverändert, Quellenvermerk, Datenbezug von losungen.de, Meldung an den Verlag.
- YouVersion Platform: technisch verfügbar (SDKs Apache-2.0), Nutzungsbedingungen für Community-/Nonprofit-Nutzung nicht belegt; App-Key-Pflicht.

### 6.8 Risiken

| Risiko | Beleg | Gegenmaßnahme |
|---|---|---|
| Fehlende kritische Masse (Netzwerkeffekt) | 20 Jahre gescheiterte christliche Netzwerke; FaithSocial „could no longer sustain itself" | Community an tägliche Lese-/Gebetsgewohnheit koppeln (YouVersion-Muster), Start über bestehende Hauskreise/Gemeinden, lokale Verdichtung statt Breite |
| Lizenzkosten/-verweigerung für moderne Übersetzung | DBG-Genehmigungspflicht, keine bibleserver-API, keine Preislisten | Frühzeitige Verhandlung, ACK-Gemeinde als Partner, NeÜ-Klärung, YouVersion Platform als Fallback |
| Finanzierung/Durchhaltefähigkeit | OSS-Features jahrelang „Sponsor me!"; Lectio 365 trägt sich erst bei hoher Reichweite | Trägerverein, Patenschaften, geringe Betriebskosten, Open Source für Mitwirkung |
| Moderations- und Safeguarding-Last | ChristianChirp-Angriffe, YouVersion-Kinderschutzkritik, DM-Blindstellen | Kleine Gruppen, Rollen, Meldewege, Altersregeln, keine unmoderierten 1:1-Kontakte mit Minderjährigen |
| Konfessionelle Fragmentierung | Segmentierte Ökosysteme (EKD/katholisch/freikirchlich) | Konfessionelle Transparenz, ökumenische Übersetzungsauswahl, keine Lehrpositionen in der App |
| Reputationsrisiko „christlich" | Gab-Vereinnahmung, Hallow-Politisierung | Keine politischen/Promi-Partner, klare Haltung in Leitlinien |
| Plattformabhängigkeit | YouVersion Platform ohne externe Beiträge, App-Key | Gemeinfreie Basis behalten, Lizenztexte lokal halten |
| Schrumpfende junge Zielgruppe in Deutschland | Shell 2024, KMU 6, Religionsmonitor | Nischenstrategie, Begleitformate statt Massenmarkt |
| Erwartung „digital statt Präsenz" | 54 %/40 % Präsenzpräferenz; „more communication but not more community" | Produktmetrik Beziehungstiefe; Präsenz-Features zentral |
| Schlüsselperson/Bus-Faktor | Accordance ohne v15 nach Tod von David Lang; e-Sword als Ein-Mann-Projekt | Open Source, Dokumentation, Trägerschaft |
| Regulatorik | Art. 9 DSGVO, DSA, kirchlicher Datenschutz | Prinzipien in 6.6 von Anfang an umsetzen |

---

## 7. Abgleich mit dem gebauten Stand von Bleibe

Grundlage: README-Abschnitt „Funktionen" (Stand des Repos). Bewertung: **umgesetzt** / **teilweise** / **offen**.

| Lücke bzw. Anforderung aus der Recherche | Stand in Bleibe |
|---|---|
| Werbefrei, ohne Abo-Paywall, ohne Dritt-Tracking | **umgesetzt** (README: werbefrei, datensparsam, ohne Abo-Paywall; eigene Session-Auth, kein Drittanbieter-Tracking) |
| Open Source als Prüfbarkeit | **umgesetzt** (MIT) |
| Datenexport, Konto löschen, Sitzungsverwaltung | **umgesetzt** |
| Art.-9-Einwilligung und Datenschutzerklärung ausformuliert | **offen** (Impressum/Datenschutz enthalten Platzhalter; explizite Einwilligungsschritte nicht erwähnt) |
| Moderne deutsche Übersetzung | **offen** (nur gemeinfreie: Luther 1912, Elberfelder 1905, Schlachter 1951, Luther 1545, dazu BSB, KJV); Lizenzstatus Schlachter 1951 prüfen; KJV in den Notizen nicht behandelt |
| Kostenlose Studienwerkzeuge (Parallelansicht, Suche, Querverweise) | **umgesetzt** (6 Übersetzungen, Parallelansicht, Volltextsuche, 250.000 Querverweise); Urtext/Strong's **offen** |
| Lesepläne ohne Streak-Druck | **umgesetzt** (18 Pläne, 7 Tage bis 2 Jahre) |
| Gemeinsame Lesepläne in Gruppen mit Diskussion („Plans with Friends") | **offen** (Pläne laut README individuell; Gruppenkopplung nicht erwähnt) |
| Zeitlich begrenzte gemeinsame Zeiten (Advent, Passion, 30 Tage) | **offen** |
| Ruhiger Tagesrhythmus, Opt-in-Erinnerungen | **teilweise** (Tagesvers, Erinnerungen per Cron für Treffen; Granularität der Benachrichtigungseinstellungen aus README nicht ersichtlich) |
| Losungen-Integration (nur nicht-kommerziell) | **offen** (Tagesvers vorhanden, Losungen nicht erwähnt) |
| Gebetswand mit Sichtbarkeit, Anonymität, „Ich bete mit", erhörte Gebete | **umgesetzt** |
| Kleine Gruppen online und vor Ort mit Rollen | **umgesetzt** |
| Übergabe der Gruppenleitung, Beitrittsregeln | **teilweise** (Rollen vorhanden; Übergabe-Flow nicht erwähnt) |
| Lokale Brücke: Treffen mit Zu-/Absage, Kapazität, ICS, Erinnerungen | **umgesetzt** |
| Gruppen/Treffen in der Nähe finden (Ortssuche) | **teilweise** („Gruppen vor Ort" vorhanden; Umkreis-/Ortssuche nicht erwähnt) |
| Gebetspartner/Begleitung | **teilweise** (Gebetspartner-Signal; kein Begleitungs-/Mentoring-Flow, keine Altersregel) |
| Notizen, Markierungen, Lesezeichen, Tagebuch, Lernverse | **umgesetzt** (inkl. Leitner-System); Geräte-Sync durch Server-Konto gegeben |
| Beiträge, Fragen, Zeugnisse, Impulse, Reaktionen, Kommentare | **umgesetzt**; zu prüfen, dass kein offener Reichweiten-Feed entsteht (bewusste Nicht-Funktion) |
| Profile, Folgen, Direktnachrichten | **umgesetzt**; Safeguarding für DMs (Minderjährige, Blockieren) **offen** |
| Moderation: Meldungen, Entfernen/Wiederherstellen, Sperren, Rollen, Audit | **umgesetzt**; automatische Wort-/Bildfilter, Altersregeln **offen** |
| Offline-Fähigkeit | **umgesetzt** (PWA, Offline-Cache) |
| Diskretion (neutrales Icon, Pseudonym) | **teilweise** (Anonymität bei Gebeten; Profile unter `/@name`; neutrale Darstellung nicht erwähnt) |
| Audio/Hörbibel | **offen** (nicht erwähnt; freie deutsche Hörbibeln nur für NeÜ/Schlachter 2000 belegt, Lizenz zu klären) |
| Zitierende Bibelsuche mit Opt-out (optional) | **offen**; derzeit keine KI, was dem YouVersion-Verzicht entspricht |
| Trägerschaft, Spendenfinanzierung, Gemeinde-Patenschaften | **offen** |
| Schnittstelle zu ChurchTools/Communi (später) | **offen** |
| Native Mobile-Apps | **offen** (PWA; Stores waren in der Recherche nicht auswertbar) |

Fazit des Abgleichs: Bleibe hat den Kern der identifizierten Lücke (Bibel + Gebet + kleine Gruppen + lokale Treffen + Moderation + Datensparsamkeit + Open Source) bereits implementiert. Die wichtigsten offenen Punkte in Reihenfolge der Hebelwirkung laut Recherche: (1) moderne deutsche Übersetzung (Lizenzverhandlung), (2) gemeinsame Lesepläne mit Gruppendiskussion und zeitlich begrenzte gemeinsame Zeiten (stärkste belegte Engagement-Muster), (3) Safeguarding-Regeln für DMs und Minderjährige, (4) Art.-9-Einwilligung und fertige Datenschutztexte, (5) Trägerschaft und Finanzierung, (6) Ortssuche für Gruppen/Treffen.

---

## 8. Quellen

Alle URLs aus den sechs Recherche-Notizen, dedupliziert (796 Einträge), sortiert nach Domain; Linktexte wie in den Notizen. Hinweis: Fast alle Quellen wurden in der Recherche nur als Suchergebnis-Auszug gelesen; sieben als „vermutete Quelle aus Vorwissen" markierte URLs sind nicht verifiziert.

1. [24-7prayer.de](https://24-7prayer.de/lectio-365-auf-deutsch/)
2. [24-7 Prayer USA](https://www.24-7prayerusa.com/resources/lectio-365)
3. [4training.net „Deutsche Bibelübersetzungen“](https://www.4training.net/German/de)
4. [6sense Church Management](https://6sense.com/tech/church-management)
5. [6sense Pushpay](https://6sense.com/tech/church-management/pushpay-market-share)
6. [6sense Churchteams](https://6sense.com/tech/church-management/churchteams-market-share)
7. [ABC7 Chicago](https://abc7chicago.com/what-is-hallow-app-mark-wahlberg-alex-jones-ceo/14579565/)
8. [abide.com Subscription](https://abide.com/sub-selection/)
9. [Accordance: Start the Year Right 2025](https://www.accordancebible.com/start-the-year-right-2025/)
10. [accordancebible.com](https://www.accordancebible.com/)
11. [Accordance: David Lang Memorial Bundle](https://www.accordancebible.com/product/david-lang-memorial-bundle/)
12. [ACS Technologies](https://www.acstechnologies.com/company/news/realm-ranked-1-most-popular-church-management-software-by-capterra/)
13. [ActsSocial Blog](https://actssocial.com/blog/best-christian-social-media-apps)
14. [ActsSocial: Christian Alternative to Facebook](https://actssocial.com/blog/christian-alternative-to-facebook)
15. [ad-hoc-news](https://www.ad-hoc-news.de/wissenschaft/gebets-app-hallow-universitaet-passau-prueft-ki-modul-magisterium-ai/70207640)
16. [ADL: Andrew Torba](https://www.adl.org/resources/article/andrew-torba-five-things-know)
17. [aej.de](https://www.aej.de/politik/zusammenleben-in-der-migrationsgesellschaft/religionsmonitor-ergebnisse-und-handlungsempfehlungen/)
18. [Air1](https://www.air1.com/faith/news/faith/a-blessing-for-ministries-youversion-gives-away-technology-behind-world-s-most-downloaded-bible-app-57991)
19. [akref.ead.de 31.01.2025](https://akref.ead.de/akref-nachrichten/2025/januar/31012025-europa-christliche-gebets-app-hallowverboten/)
20. [A. Larry Ross Communications: Pray.com](https://www.alarryross.com/praycom)
21. [Aleteia 20.02.2026](https://aleteia.org/2026/02/20/hallow-catholic-prayer-app-tops-charts-at-1/)
22. [Aleteia 14.02.2024](https://aleteia.org/2024/02/14/hallow-sees-most-downloads-in-1-minute-after-super-bowl-ad/)
23. [Aleteia 07.02.2025](https://aleteia.org/2025/02/07/hallow-prayer-app-may-soon-be-forced-out-of-the-eu/)
24. [all4phones.de: Hallow-Review](https://all4phones.de/articles/hallow-die-beste-app-fuer-katholischen-glauben-gebet-meditation.1849/)
25. [Amazon: Olive Tree](https://www.amazon.com/HarperCollins-Christian-Publishing-Bible-Olive/dp/B004N8W292)
26. [Amazon: BLB](https://www.amazon.com/Blue-Letter-Bible/dp/B00T4YU2JM)
27. [Amazon Appstore](https://www.amazon.com/rk-private-Herrnhuter-Losungen/dp/B01NAS6JQW)
28. [Amazon Appstore: ODB](https://www.amazon.com/Our-Daily-Bread-Ministries/dp/B0062QUNHG)
29. [America Magazine 24.11.2021](https://www.americamagazine.org/faith/2021/11/24/hallow-prayer-app-241910/)
30. [America Magazine 24.02.2026](https://www.americamagazine.org/news/2026/02/24/prayer-app-hallow-tucker-carlson/)
31. [America Magazine 08.04.2025](https://www.americamagazine.org/faith/2025/04/08/hallow-app-russell-brand-rape-charges-250337/)
32. [americanbible.org (vermutete Quelle aus Vorwissen, unverifiziert)](https://www.americanbible.org/state-of-the-bible/)
33. [amos-it: Messenger im pastoralen Alltag](https://amos-it.de/kirchedigital/messenger-im-pastoralen-alltag/)
34. [APD](https://www.apd.info/news/2024/10/17/religion-verliert-f%C3%BCr-christliche-jugendliche-an-bedeutung-419939)
35. [GitHub-API-Suche „churchtools“](https://api.github.com/search/repositories?q=churchtools&sort=stars&per_page=25)
36. [GitHub-API-Suche „luther 1912“](https://api.github.com/search/repositories?q=%22luther+1912%22&sort=stars&per_page=25)
37. [GitHub-API-Suche „bibleserver“](https://api.github.com/search/repositories?q=bibleserver&sort=stars&per_page=25)
38. [GitHub-API: AndBible](https://api.github.com/search/repositories?q=AndBible&sort=stars&order=desc&per_page=5)
39. [GitHub-API-Suche](https://api.github.com/search/issues?q=%22bible+app%22+%22I+wish%22&sort=comments&order=desc&per_page=30)
40. [GitHub-API-Suche](https://api.github.com/search/repositories?q=christian+social+network&sort=stars&order=desc&per_page=20)
41. [GitHub-API-Suche](https://api.github.com/search/repositories?q=prayer+app&sort=stars&order=desc&per_page=20)
42. [GitHub-API-Suche](https://api.github.com/search/repositories?q=christian&sort=stars&order=desc&per_page=30)
43. [GitHub-API-Suche](https://api.github.com/search/repositories?q=bible+app&sort=stars&order=desc&per_page=25)
44. [GitHub-API: ChurchApps](https://api.github.com/search/repositories?q=user:ChurchApps&sort=stars&order=desc&per_page=30)
45. [GitHub-API-Suche „church management system"](https://api.github.com/search/repositories?q=church+management+system&sort=stars&order=desc&per_page=15)
46. [GitHub-API-Suche](https://api.github.com/search/repositories?q=bible+reading+plan&sort=stars&order=desc&per_page=15)
47. [GitHub-API-Suche](https://api.github.com/search/repositories?q=scripture+memory&sort=stars&order=desc&per_page=15)
48. [GitHub-API-Suche](https://api.github.com/search/repositories?q=bibel+app&sort=stars&order=desc&per_page=25)
49. [GitHub-API-Suche](https://api.github.com/search/repositories?q=christian+bible+app+community&sort=stars&order=desc&per_page=30)
50. [GitHub-API-Suche „offene bibel"](https://api.github.com/search/repositories?q=offene+bibel&sort=stars&order=desc&per_page=15)
51. [GitHub-API-Suche AndBible+AI](https://api.github.com/search/issues?q=repo:AndBible/and-bible+AI+is:issue&sort=created&order=desc&per_page=20)
52. [GitHub-API-Suche](https://api.github.com/search/issues?q=%22prayer+request%22+app+feature&sort=comments&order=desc&per_page=20)
53. [GitHub-API: youversion-Repos](https://api.github.com/search/repositories?q=user:youversion&sort=updated&order=desc&per_page=30)
54. [GitHub-API-Suche „churchtools"](https://api.github.com/search/repositories?q=churchtools&sort=stars&order=desc&per_page=15)
55. [GitHub-API-Suche](https://api.github.com/search/repositories?q=lutherbibel&sort=stars&order=desc&per_page=20)
56. [GitHub-API-Suche](https://api.github.com/search/repositories?q=bibel+deutsch+luther&sort=stars&order=desc&per_page=25)
57. [Dealroom](https://app.dealroom.co/news/feed/hallow-raises-50m-series-c-funding)
58. [Sensor Tower: YouVersion Android](https://app.sensortower.com/overview/com.sirma.mobile.bible.android?country=US)
59. [Sensor Tower: Bible Chat](https://app.sensortower.com/overview/6448849666?country=US)
60. [Sensor Tower: Hallow](https://app.sensortower.com/overview/1405323394?country=US)
61. [Sensor Tower iOS Abide](https://app.sensortower.com/overview/726031617?country=US)
62. [Sensor Tower Android Abide](https://app.sensortower.com/android/us/carpenters-code-inc/app/abide-christian-meditation/is.abide)
63. [AppAdvice: STEP Bible](https://appadvice.com/app/step-bible/1476903313)
64. [AppBrain: BLB](https://www.appbrain.com/app/blue-letter-bible/org.blueletterbible.blb)
65. [AppBrain: STEP Bible](https://www.appbrain.com/app/step-bible-scripture-tools-fo/com.tyndale.stepbible)
66. [AppBrain](https://www.appbrain.com/app/bible-in-one-year/com.multipie.bibleinoneyear)
67. [Appfigures: The Most Predictable Spike in the App Store](https://appfigures.com/resources/insights/hallow-lent-surge-prayer-app-revenue)
68. [Appfigures 2023](https://appfigures.com/resources/insights/20230324?f=4)
69. [AppGrooves: Negative Reviews](https://appgrooves.com/app/bible-by-olive-tree-by-harpercollins-christian-publishing-inc/negative)
70. [App Store DE](https://apps.apple.com/de/app/bibel/id282935706)
71. [App Store: e-Sword HD](https://apps.apple.com/us/app/e-sword-hd-bible-study-to-go/id567008119)
72. [App Store: Glorify](https://apps.apple.com/us/app/glorify-devotional-prayer/id1490587079?see-all=reviews)
73. [App Store: Olive Tree](https://apps.apple.com/us/app/bible-by-olive-tree-esv-kjv/id332615624)
74. [App Store: Bible Gateway](https://apps.apple.com/us/app/bible-gateway/id506512797)
75. [App Store Reviews](https://apps.apple.com/us/app/bible-gateway/id506512797?see-all=reviews)
76. [App Store: Bible Hub](https://apps.apple.com/no/app/bible-hub/id1090228108)
77. [MCSN App Store](https://apps.apple.com/eg/app/my-christian-social-network/id6448567108)
78. [App Store: Church Center](https://apps.apple.com/us/app/church-center-app/id1357742931)
79. [App Store: The Chosen](https://apps.apple.com/md/app/the-chosen/id6443956656)
80. [App Store: The Chosen Church](https://apps.apple.com/us/app/the-chosen-church/id1621762566)
81. [App Store: The CHOSEN Collective](https://apps.apple.com/us/app/the-chosen-collective/id6763342981)
82. [Apple App Store](https://apps.apple.com/us/app/id6504086818)
83. [Apple App Store: Glorify](https://apps.apple.com/us/app/glorify-devotional-prayer/id1490587079)
84. [Apple App Store DE](https://apps.apple.com/de/app/hallow-gebet-meditation/id1405323394)
85. [Apple App Store DE: Lectio 365](https://apps.apple.com/de/app/lectio-365/id1483974820)
86. [Apple App Store: First 5](https://apps.apple.com/us/app/first-5/id997457664)
87. [Apple App Store](https://apps.apple.com/us/app/bible-in-one-year/id504133402)
88. [Apple App Store: She Reads Truth](https://apps.apple.com/us/app/she-reads-truth/id892128363)
89. [Apple App Store UK](https://apps.apple.com/gb/app/soultime-christian-meditation/id1369059690)
90. [Apple App Store](https://apps.apple.com/us/app/text-with-jesus/id6446922759)
91. [AppUpward](https://www.appupward.com/post/upward-abide)
92. [archiv-vegelahn.de](https://archiv-vegelahn.de/index.php/bibelarchiv/33-geschichte/15143-auflistung-deutscher-bibeln/)
93. [Archdiocese of New York](https://www.archny.org/posts/catholic-prayer-app-hallow-he-gets-us-campaign-to-run-faith-focused-super-bowl-commercials)
94. [artikel91.eu 2021: Signal, Threema, Telegram als Alternativen](https://artikel91.eu/2021/01/19/signal-threema-telegram-whatsapp-alternativen-fuer-die-kirche/)
95. [arXiv 2605.22975](https://arxiv.org/pdf/2605.22975)
96. [arXiv 2602.04017](https://arxiv.org/pdf/2602.04017)
97. [arXiv 2603.28944](https://arxiv.org/pdf/2603.28944)
98. [Awake America (zitiert Sensor Tower)](https://www.awakeamerica.com/revival-news/bible-sales-faith-app-downloads-christian-music-streams-surge-signs-of-revival-in-america)
99. [AWC Guide: YouVersion Problems](https://awc.airforce.mil.ng/problems-with-youversion-bible-app/)
100. [Axios Chicago](https://www.axios.com/local/chicago/2024/02/21/mark-wahlberg-hallow-prayer-app-ad-commercial-superbowl)
101. [BackerKit](https://www.backerkit.com/projects/47059836/dwell-scripture-listening-app)
102. [Baptist Standard](https://baptiststandard.com/news/faith-culture/intergenerational-groups-may-be-key-to-discipleship/)
103. [Barna](https://www.barna.com/research/meet-love-jesus-not-church/)
104. [Barna: 4 Barriers](https://www.barna.com/trends/discipleship-barriers/)
105. [Barna: Who Disciples](https://www.barna.com/trends/who-disciples-churchgoers/)
106. [Barna: Gen Z's Emotional Challenges](https://www.barna.com/trends/gen-z-emotions/)
107. [Barna: Pastor Support Systems (7-Year Trends)](https://www.barna.com/research/pastor-support-systems/)
108. [Barna: Fostering Relationships at Church](https://www.barna.com/trends/fostering-relationships-at-church/)
109. [Barna: Young Adults Lead Resurgence](https://www.barna.com/research/young-adults-lead-resurgence-in-church-attendance/)
110. [Barna: Church Attendance 2022](https://www.barna.com/research/church-attendance-2022/)
111. [Barna: In-Person over Online Church](https://www.barna.com/research/in-person-over-online-church/)
112. [Barna: What Churches Might Miss When Measuring Digital Attendance](https://www.barna.com/research/watching-online-church/)
113. [barna.com (vermutete Quelle aus Vorwissen, unverifiziert)](https://www.barna.com/research/belief-in-jesus-rises/)
114. [barna.com (vermutete Quelle aus Vorwissen, unverifiziert)](https://www.barna.com/the-open-generation/)
115. [Baylor Lariat 16.04.2025](https://baylorlariat.com/2025/04/16/hallow-app-balances-faith-capitalism/)
116. [befg.de](https://www.befg.de/angebote-fuer/gemeinden/communi-app)
117. [Beliefnet Aug. 2025](https://www.beliefnet.com/columnists/christnewstoday/2025/08/ai-chatbots-are-claiming-to-be-christ-preying-on-christians.html)
118. [Berean Bible Committee](https://berean.bible/committee.htm)
119. [Religionsmonitor kompakt (PDF)](https://www.bertelsmann-stiftung.de/fileadmin/files/Projekte/51_Religionsmonitor/Religionsmoni_kompakt_final2.pdf)
120. [Bertelsmann „Zusammenleben in religiöser Vielfalt“ (PDF)](https://www.bertelsmann-stiftung.de/fileadmin/files/BSt/Publikationen/GrauePublikationen/ST_DZ_Religionsmonitor_Zusammenleben_in_religioeser_Vielfalt_2023.pdf)
121. [BFP-Aktuell](https://www.bfp-aktuell.de/details/youversion-begeistert-weltweit)
122. [Bibelliga](https://www.bibelliga.org/bibel-online-lesen-die-besten-kostenlosen-apps-und-websites/)
123. [bibelliga.org](https://www.bibelliga.org/christliche-apps-bibel-besser-verstehen-und-im-glauben-wachsen/)
124. [Bibelwerk-Verlag Presseinformation (PDF)](https://www.bibelwerkverlag.de/fileadmin/verlag/BibelApp/Presseinformation_EUE_App.pdf)
125. [bible.alpha.org/about](https://bible.alpha.org/en/about/)
126. [bible.com/kids](https://www.bible.com/kids)
127. [YouVersion Datenschutz](https://www.bible.com/privacy)
128. [bible.com](https://www.bible.com/versions/157-sch2000-die-bibel-schlachter-2000)
129. [bible.com Audio](https://www.bible.com/audio-bible-app-versions/157-sch2000-die-bibel-(schlachter-2000)
130. [bible2.net (Bibel 2.0), Jan. 2014](https://bible2.net/de/2014/01/herrnhuter-losung-ende-der-kostenlosen-apps-fur-android-und-iphone-243)
131. [Bible Buying Guide](https://biblebuyingguide.com/logos-subscriptions-a-detailed-look-at-the-new-logos/)
132. [Bible Buying Guide: Study Assistant](https://biblebuyingguide.com/new-logos-bible-software-feature-study-assistant/)
133. [biblehub.com](https://biblehub.com/)
134. [biblehub.com/about](https://biblehub.com/about.htm)
135. [BibleMate-Blog](https://bibleinyear.com/blog/best-bible-apps)
136. [bibleinyear.com: YouVersion Review](https://www.bibleinyear.com/blog/youversion-bible-app)
137. [bibleinyear.com: BLB](https://www.bibleinyear.com/blog/blue-letter-bible-app)
138. [BibleNow Vergleich 2026](https://www.biblenow.app/en/blog/best-bible-reading-apps-2026)
139. [bibleproject.com/app](https://bibleproject.com/app/)
140. [Review biblequestions.info](https://biblequestions.info/reviews/review-echo-prayer-app/)
141. [bibleserver.com/bible/LUT](https://www.bibleserver.com/bible/LUT)
142. [bibleserver.com/webmasters](https://www.bibleserver.com/webmasters)
143. [bibleserver.com/help](https://www.bibleserver.com/help)
144. [biblesociety.org.uk (vermutete Quelle aus Vorwissen, unverifiziert)](https://www.biblesociety.org.uk/research/quiet-revival)
145. [Bistum Osnabrück](https://bistum-osnabrueck.de/da-zwischen-wird-zur-app/)
146. [Bistum Trier](https://www.bistum-trier.de/news/aktuell/news/artikel/Christliche-Community-ist-als-App-verfuegbar/)
147. [James L. Paris: What happened to ChristianChirp](https://blog.christianmoney.com/2013/06/what-happened-to-christianchirp.html)
148. [YouVersion Blog 2017](https://blog.youversion.com/2017/11/youversion-bible-app-announcing-plans-with-friends-2017/)
149. [YouVersion Blog 2013](https://blog.youversion.com/2013/12/the-bible-app-for-kids-surpasses-one-million-installs/)
150. [YouVersion Blog DE 2015](https://blog.youversion.com/de/2015/08/bafk-now-in-german/)
151. [YouVersion Blog 2020](https://blog.youversion.com/2020/03/youversion-bible-app-now-in-the-bible-app-prayer-feature-full-announcement/)
152. [EFCA Blog](https://blogs.efca.org/posts/tyndale-house-and-the-step-bible-online-and-free-resource)
153. [Bloomberg Línea 08.03.2022](https://www.bloomberglinea.com/2022/03/08/the-retaining-business-of-faith-glorify-raises-40m-from-softbank/)
154. [BLB FAQ](https://www.blueletterbible.org/about/faqs.cfm)
155. [BLB Android](https://www.blueletterbible.org/android/)
156. [BLB Partnership](https://www.blueletterbible.org/about/partnership.cfm)
157. [BLB History](https://www.blueletterbible.org/about/history.cfm)
158. [Bonifatiuswerk Firm-Begleiter 2023 (PDF)](https://www.bonifatiuswerk.de/fileadmin/user_upload/bonifatiuswerk/aktionen/Firm/2023/Firm-Begleiter2023_web.pdf)
159. [Brandon Hilgemann: Sermon Assistant Preview](https://brandonhilgemann.com/logos-sermon-assistant-ai-preview/)
160. [Biblical Recorder](https://www.brnow.org/news/pastors-report-feeling-more-loneliness-less-support-barna-finds/)
161. [Inquirer/AFP](https://business.inquirer.net/550561/virtual-jesus-people-of-faith-divided-as-ai-enters-religion)
162. [BusinessCloud](https://businesscloud.co.uk/news/softbank-backs-christian-app-glorify-in-new-30m-round/)
163. [businessmodelcanvastemplate: Pray.com history](https://businessmodelcanvastemplate.com/blogs/brief-history/pray-com-brief-history)
164. [BuzzFeed News](https://www.buzzfeednews.com/article/emilybakerwhite/apps-selling-your-prayers)
165. [Called: 5 Christian Apps for Youth Ministry Safety](https://called.app/resources/5-christian-apps-for-youth-ministry-safety-and-which-ones-to-avoid/)
166. [Capterra](https://www.capterra.com/p/275095/Logos/reviews/)
167. [Capterra Breeze/Tithely](https://capterra.com/p/132513/Breeze-ChMS/)
168. [Capterra Vergleich Breeze vs Churchteams](https://www.capterra.com/church-management-software/compare/132513-103773/Breeze-ChMS-vs-Churchteams)
169. [Capterra DE: ChurchTools](https://www.capterra.com.de/software/158007/churchtools)
170. [Capterra DE Verzeichnis Kirchenverwaltung](https://www.capterra.com.de/directory/20046/church-management/software)
171. [Cascadia Daily, 29.9.2025](https://www.cascadiadaily.com/2025/sep/29/briefs-faithlife-exodus-pharmacy-expansion-company-confidence/)
172. [Catholic365](https://www.catholic365.com/article/32625/the-false-propaganda-machine-hallow-joins-the-club.html)
173. [Catholic Review](https://catholicreview.org/new-barna-study-shows-fellowship-discipleship-are-key-to-fostering-resilient-faith/)
174. [CatholicVote](https://catholicvote.org/text-with-jesus-ai-chatbot-app-draws-criticism-including-for-option-to-message-with-satan/)
175. [Catholic Standard: Lent 2026](https://www.cathstan.org/voices/new-resources-to-encounter-christ-this-lent-2026)
176. [CB Insights](https://www.cbinsights.com/company/glorify)
177. [CBN](https://cbn.com/news/us/bible-app-engagement-spikes-and-most-read-verse-2024-says-lot-about-our-world)
178. [CBN](https://cbn.com/news/health/youversion-offers-features-combat-epidemic-loneliness-and-isolation)
179. [CBN](https://cbn.com/news/us/faith-tech-merger-glorify-offers-worlds-first-christian-smart-ring)
180. [CBN: 56 Sprachen](https://cbn.com/news/cwn/innovative-bibleproject-opens-gods-word-millions-56-languages-story-leads-jesus)
181. [CBN](https://cbn.com/news/us/fighting-fear-was-most-read-scripture-2025-bible-app)
182. [ccli.com/de/de](https://ccli.com/de/de)
183. [cebooks.de](https://cebooks.de/collections/hormedien-hoerbibel)
184. [chmeetings](https://www.chmeetings.com/blog/best-bible-apps/)
185. [ChMeetings: Using Telegram Channels for Church Services](https://www.chmeetings.com/blog/using-telegram-channels-for-church-services/)
186. [The Christian Institute](https://www.christian.org.uk/news/even-the-best-ai-misquotes-scripture-says-bible-app-boss/)
187. [Christian Century, Aug. 2008](https://www.christiancentury.org/article/2008-08/churches-using-internet-social-networking)
188. [Christian Century 2015](https://www.christiancentury.org/article/2015-07/brazils-christian-facebook-better-networking-alternative)
189. [Christian Daily International](https://www.christiandaily.com/news/isaiah-41-10-named-youversions-most-popular-bible-verse-as-app-logs-record-engagement-in-2025)
190. [Christian Daily International](https://www.christiandaily.com/news/youversion-bible-app-hits-record-798k-installations-in-single-day)
191. [Christian Daily International](https://www.christiandaily.com/news/youversion-marks-billion-install-milestone-with-global-livestream-celebration)
192. [Christian Daily International](https://www.christiandaily.com/news/ais-scripture-problem-misquotes-range-from-15-to-60-says-youversion-ceo)
193. [Christian Daily International](https://www.christiandaily.com/)
194. [Christian Educators Academy](https://christianeducatorsacademy.com/is-there-a-christian-alternative-to-facebook/)
195. [christianforums.net: Shoutlife?](https://christianforums.net/threads/shoutlife.33668/)
196. [Christianity Daily](https://www.christianitydaily.com/news/glorify-bible-app-designed-to-help-bring-people-of-all-lifestyles-closer-to-god-receives-40m-in-funding.html)
197. [Christianity Today, 2023](https://www.christianitytoday.com/2023/06/bible-app-lite-youversion-africa-offline-low-bandwidth-inte/)
198. [Christianity Today, 5.3.2025](https://www.christianitytoday.com/2025/03/devotion-prayer-app-glorify-tim-timberlake/)
199. [CT: How Technology Transformed the Global Church](https://www.christianitytoday.com/2025/11/christianity-at-a-crossroads-hempton/)
200. [CT: Church in a Time of Brain Rot (Juli 2025)](https://www.christianitytoday.com/2025/07/church-brain-rot-nicholas-carr-superbloom-ivan-illich-community/)
201. [Christianity Today 2017](https://www.christianitytoday.com/2017/04/love-jesus-not-church-barna-spiritual-but-not-religious/)
202. [Christianity Today: Gen Z leads church attendance](https://www.christianitytoday.com/2025/09/study-gen-z-leads-church-attendance-average/)
203. [Christian Post 2024](https://www.christianpost.com/news/youversion-reveals-top-bible-verse-for-2024.html)
204. [Christian Post](https://www.christianpost.com/news/youversion-bible-app-hits-record-798k-installations-in-single-day.html)
205. [Christian Post](https://www.christianpost.com/news/the-bible-project-launches-new-app-with-biblical-storytelling.html)
206. [Christian Post](https://www.christianpost.com/news/youversion-founder-talks-concerns-about-pastors-embrace-of-ai.html)
207. [Christian Post 2017](https://www.christianpost.com/news/social-cross-website-offers-christians-alternative-facebook-196418/)
208. [Christian Post](https://www.christianpost.com/news/godtube-head-dreams-of-christian-tech-growth.html)
209. [Christian Post: Salem acquires GodTube/Tangle](https://www.christianpost.com/news/salem-web-network-acquires-godtubecom-tanglecom.html)
210. [Christian Post: GodTube returns](https://www.christianpost.com/news/godtube-returns-with-new-campaign-50043)
211. [Christian Post: Gen Z struggles with small groups](https://www.christianpost.com/news/gen-z-struggles-with-small-groups-barna.html)
212. [Christian Post](https://www.christianpost.com/news/prayer-app-hallow-may-be-banned-in-europe.html)
213. [Christian Today](https://www.christiantoday.com/news/this-new-bible-tool-could-revolutionise-scripture-reading-across-the-world)
214. [Christian Today](https://www.christiantoday.com/news/concerns-raised-over-theological-bias-in-ai-bible-chatbots)
215. [Christian Today 2007](https://www.christiantoday.com/article/christian.alternative.for.myspacecom.created/7213.htm)
216. [christlicheperlen „Copyrightfreie Bibeltexte“ (2011)](https://christlicheperlen.wpcomstaging.com/2011/09/07/tipp-frei-nutzbare-bibeltexte/)
217. [Christ Over All: Ethics of Sermon Prep](https://christoverall.com/article/concise/encore-a-brave-new-world-of-preaching-logos-ai-sermon-assistant-and-the-ethics-of-sermon-prep/)
218. [church.tools](https://www.church.tools/)
219. [ChurchTools für Landeskirchen](https://church.tools/de/landeskirchen/)
220. [Church IT Network](https://churchitnetwork.com/resources/discord)
221. [ChurchLeaders](https://churchleaders.com/news/2209898-youversion-2025-verse-of-the-year-bobby-gruenewald.html)
222. [ChurchLeaders: Loneliness in Ministry](https://churchleaders.com/state-of-the-church/516359-loneliness-in-ministry-what-barna-and-gloos-state-of-the-church-data-reveals.html)
223. [ChurchLeaders: Fostering Relationships](https://churchleaders.com/state-of-the-church/2207661-fostering-relationships-church-engagement.html)
224. [ChurchLeaders: Loneliness in Ministry](https://churchleaders.com/state-of-the-church/516359-loneliness-in-ministry-what-barna-and-gloos-state-of-the-church-data-reveals.html/2)
225. [ChurchLeaders Feb. 2026](https://churchleaders.com/news/2213701-hallow-app-ceo-demonic-audio-lent-prayer-challenge.html)
226. [ChurchLeaders Zusammenfassung](https://churchleaders.com/news/415875-christian-meditation-and-prayer-apps-mine-data.html)
227. [ChurchMemberPro: Best ChMS 2026](https://churchmemberpro.com/blog/best-church-management-software/)
228. [ChurchMemberPro: Pushpay Review](https://churchmemberpro.com/blog/pushpay-review/)
229. [churchonlineplatform.com](https://churchonlineplatform.com/)
230. [Discipls/churchsocial.ai: Top 12 Free Church Communication Apps 2026](https://www.churchsocial.ai/blog/free-church-communication-apps)
231. [ChurchTechToday: Sneak Peek](https://churchtechtoday.com/logos-ai-sermon-assistant-sneak-peek/)
232. [ChurchTechToday](https://churchtechtoday.com/faithlife-end-of-faithlife-equip-chms/)
233. [ChurchTechToday](https://churchtechtoday.com/pushpay-acquisition/)
234. [communiapp.de](https://communiapp.de/)
235. [communiapp.de „ChurchTools vs. Communi“](https://communiapp.de/churchtools-vs-communi/)
236. [communiapp.de PDF](https://communiapp.de/wp-content/uploads/2022/01/Communi_Magazin_druck.pdf)
237. [Logos Community: Faithlife exiting Church Management](https://community.logos.com/discussion/210463/product-news-faithlife-is-exiting-church-management/p1)
238. [Logos Community: Update for Faithlife Connect subscribers](https://community.logos.com/forums/topic/208086-official-update-for-faithlife-connect-subscribers/)
239. [Logos Community: Thoughts on the cost](https://community.logos.com/forums/topic/209099-thoughts-on-the-cost-of-a-subscription/)
240. [Logos Community: New feature Smart Search](https://community.logos.com/discussion/221560/new-feature-smart-search/p1)
241. [Logos Community: Logos 46.0](https://community.logos.com/kb/articles/2919-logos-46-0)
242. [Logos Community: Study Assistant credit usage](https://community.logos.com/discussion/253545/study-assistant-ai-credit-usage)
243. [Logos Community: New feature Sermon Assistant](https://community.logos.com/forums/topic/205386-new-feature-sermon-assistant/)
244. [Logos Community: Where is the Faithlife Social Group Chat](https://community.logos.com/discussion/244795/where-is-the-faithlife-social-group-chat-feature-in-the-logos-mobile-app)
245. [Logos Community: What happened to Faithlife Connect](https://community.logos.com/discussion/220945/what-happened-to-faithlife-connect/p1)
246. [community.logos.com](https://community.logos.com/forums/t/212789.aspx)
247. [Consumer Startups](https://www.consumerstartups.com/p/hallow-building-a-9-figure-prayer-app)
248. [EPIC: Liturgy in the Living Room](https://www.covidreligionresearch.org/study-shows-online-church-attendance/)
249. [EPIC: Five Years Later](https://www.covidreligionresearch.org/five-years-later-how-covid-19-reshaped-american-religious-life/)
250. [Crosswalk/Michael Foust](https://www.crosswalk.com/headlines/contributors/michael-foust/youversion-reveals-2024s-most-popular-verse-and-says-people-are-seeking-god.html)
251. [Crosswalk/Michael Foust](https://www.crosswalk.com/headlines/contributors/michael-foust/study-warns-ai-jesus-chatbots-often-give-unbiblical-answers-driven-by-profit-motives.html)
252. [Crunchbase](https://www.crunchbase.com/organization/glorify)
253. [Crunchbase](https://www.crunchbase.com/acquisition/bgh-capital-acquires-pushpay--7bedc448)
254. [Crunchbase Hallow Financials](https://www.crunchbase.com/organization/hallow/company_financials)
255. [Crunchbase Pray.com](https://www.crunchbase.com/organization/pray)
256. [Crux/CNS April 2022](https://cruxnow.com/cns/2022/04/prayer-apps-are-popular-but-users-cautioned-to-review-privacy-policies)
257. [CWG Ministries](https://www.cwgministries.org/e-sword-worlds-most-popular-bible-software-and-its-free)
258. [da-zwischen.community](https://www.da-zwischen.community/)
259. [dailyaudiobible.com](https://dailyaudiobible.com/initiatives/sneezing-jesus/author/)
260. [medium.com/dailybug](https://dailybug.medium.com/die-corona-reaktion-701e5e30063e)
261. [Daily Declaration (AU, meinungsstark)](https://dailydeclaration.org.au/2025/02/19/eu-esafety-hallow/)
262. [datenschutz-am-bodensee.com](https://datenschutz-am-bodensee.com/zum-einsatz-von-whatsapp-als-messengerdienst-in-der-katholischen-kirche/)
263. [MinistryWatch: FCBH](https://db.ministrywatch.com/ministry.php?ein=850223225)
264. [dbis.ur.de](https://dbis.ur.de/DM/resources/7638)
265. [dbk.de Merkblatt (PDF)](https://www.dbk.de/fileadmin/redaktion/diverse_downloads/VDD_2021/2021_Merkblatt_Genehmigungspflicht-Abdruck-von-Textpassagen-aus-liturg.-Buechern.pdf)
266. [de.ccli.com/songselect](https://de.ccli.com/songselect/)
267. [Wikipedia](https://de.wikipedia.org/wiki/Kirchenmitgliedschaftsuntersuchung)
268. [Dealroom Pray.com](https://dealroom.co/companies/pray-com/)
269. [Defend Young Minds](https://www.defendyoungminds.com/post/dangers-of-discord-6-steps-safeguarding-teens-on-popular-chat-app)
270. [updatestar](https://die-bibel-de.updatestar.com/)
271. [die-bibel.de/app](https://www.die-bibel.de/app)
272. [die-bibel.de/konapp](https://www.die-bibel.de/bibel-in-der-praxis/bibel-im-alltag/bibel-apps/konapp)
273. [die-bibel.de/ueber-uns/lizenzen](https://www.die-bibel.de/ueber-uns/lizenzen)
274. [die-bibel.de/ueber-uns/ansprechpartner](https://www.die-bibel.de/ueber-uns/ansprechpartner)
275. [die-bibel.de WiBiLex](https://www.die-bibel.de/ressourcen/wibilex/altes-testament/bibeluebersetzungen-christliche-deutsche)
276. [die-gemeinde-app.de](https://die-gemeinde-app.de/)
277. [Die Tagespost](https://www.die-tagespost.de/kultur/medien/kreuzigung-einer-katholischen-app-art-264609)
278. [Die Tagespost](https://www.die-tagespost.de/kirche/aktuell/hallow-app-fitness-app-fuer-geist-und-seele-art-236709)
279. [Die Tagespost](https://www.die-tagespost.de/kirche/aktuell/hallow-app-adventschallenge-oder-drei-wochen-mit-johannes-paul-ii-art-257891)
280. [Digital Ministry Substack](https://digitalministry.substack.com/p/what-is-discord-and-why-should-your)
281. [Disboard „church“](https://disboard.org/servers/tag/church)
282. [Disciples Today Review](https://disciplestoday.org/a-brief-review-of-step-scripture-tools-for-every-person/)
283. [discord.com Christianity Discord](https://discord.com/servers/christianity-discord-771132645551374366)
284. [divine-connect.de](https://divine-connect.de/)
285. [djchuang.com](https://djchuang.com/list-of-christian-social-networks/)
286. [djchuang: SocialCross was a Christian Social Network](https://djchuang.wordpress.com/2020/08/02/socialcross-was-a-christian-social-network/)
287. [domradio.de](https://www.domradio.de/artikel/christliche-community-zieht-mit-kommunikation-auf-app-um)
288. [domradio.de](https://www.domradio.de/artikel/ergebnisse-des-religionsmonitors-2023-vorgestellt)
289. [domradio.de](https://www.domradio.de/artikel/passauer-theologen-untersuchen-ki-gebets-app-hallow)
290. [doxa.app: Best Bible Apps with AI](https://doxa.app/blog/best-bible-apps-with-ai)
291. [Doxa Blog](https://doxa.app/blog/prayer-app-comparison)
292. [DSN Group: Messenger in der evangelischen Kirche](https://www.dsn-group.de/datenschutz-notizen/messenger-in-der-evangelischen-kirche-3321505)
293. [Dwell Duo](https://dwellapp.io/pricing/duo)
294. [Dwell Family](https://dwellapp.io/pricing/family)
295. [Dwell Pricing](https://dwellapp.io/pricing)
296. [Dwell Press](https://dwellapp.io/press/dwell-kickstarter-successful-fourth-most-funded-app-ever)
297. [Dwell About](https://dwellapp.io/about_us)
298. [Dwell for Churches](https://dwellapp.io/churches)
299. [e-sword.net](https://www.e-sword.net/)
300. [e-Sword History](https://www.e-sword.net/history.html)
301. [echoprayer.com](https://www.echoprayer.com/)
302. [Echo+ Membership](https://www.echoprayer.com/support-articles/echo-membership)
303. [echoprayer.com/echo-plus](https://www.echoprayer.com/echo-plus)
304. [eDisciples: Dangers of running a church WhatsApp group](https://www.edisciples.com/news/general/the-dangers-of-running-a-church-whatsapp-group/)
305. [EIN Presswire](https://www.einpresswire.com/article/902923269/youversion-gives-away-the-technology-behind-the-world-s-most-downloaded-bible-app)
306. [ekd.de „KonApp toppt mit Nutzerzahlen“](https://www.ekd.de/konapp-toppt-mit-nutzerzahlen-57173.htm)
307. [ekd.de/konapp](https://www.ekd.de/konapp-83184.htm)
308. [ekd.de](https://www.ekd.de/grosse-nachfrage-digitale-angebote-konfiweb-konapp-55624.htm)
309. [ekd.de Ergebnisse 6. KMU](https://www.ekd.de/ergebnisse-der-6-kirchenmitgliedschaftsuntersuchung-80962.htm)
310. [Ekklesia 360 About](https://www.ekklesia360.com/about/ekklesia-360/)
311. [elk-wue.de 20.01.2021](https://www.elk-wue.de/news/2021/20012021-digital-die-basisbibel-lesen-so-gehts)
312. [elk-wue.de 09.07.2020](https://www.elk-wue.de/news/2020/09072020-die-konapp-legt-deutlich-zu)
313. [elk-wue.de](https://www.elk-wue.de/gesellschaft/digitalisierung/digitalisierung-in-der-landeskirche/veranstaltungen)
314. [elkb-digital.de](https://elkb-digital.de/2023/11/27/kirchenmitgliedschaftsuntersuchung-kmu-6-neue-kommunikations-und-glaubensformen/)
315. [emk.de](https://www.emk.de/digitalisierung/aktuelles/einfuehrung-von-churchtools-ab-februar-2026)
316. [Wikipedia: YouVersion](https://en.wikipedia.org/wiki/YouVersion)
317. [Wikipedia: Accordance](https://en.wikipedia.org/wiki/Accordance)
318. [Wikipedia: Logos](https://en.wikipedia.org/wiki/Logos_Bible_Software)
319. [Wikipedia: Olive Tree](https://en.wikipedia.org/wiki/Olive_Tree_Bible_Software)
320. [Wikipedia: BibleGateway](https://en.wikipedia.org/wiki/BibleGateway)
321. [Wikipedia: BLB](https://en.wikipedia.org/wiki/Blue_Letter_Bible)
322. [Wikipedia: BibleProject](https://en.wikipedia.org/wiki/BibleProject)
323. [Wikipedia: Bobby Gruenewald](https://en.wikipedia.org/wiki/Bobby_Gruenewald)
324. [Wikipedia: Faithlife](https://en.wikipedia.org/wiki/Faithlife_Corporation)
325. [Wikipedia: Godtube](https://en.wikipedia.org/wiki/Godtube)
326. [Wikipedia: Salem Web Network](https://en.wikipedia.org/wiki/Salem_Web_Network)
327. [Wikipedia: Gab](https://en.wikipedia.org/wiki/Gab_(social_network)
328. [Wikipedia: Hallow](https://en.wikipedia.org/wiki/Hallow_(app)
329. [Wikipedia: Pray.com](https://en.wikipedia.org/wiki/Pray.com)
330. [Wikipedia: Pushpay](https://en.wikipedia.org/wiki/Pushpay)
331. [english.katholisch.de: Hallow und US-Wahlen](https://english.katholisch.de/artikel/57139-what-role-does-the-prayer-app-hallow-play-in-the-us-elections)
332. [ensecur: EKD Datenschutz Messenger](https://www.ensecur.de/datenschutzkonformer-einsatz-von-messengern-in-kirchlichen-evangelischen-stellen/)
333. [Erzbistum Köln](https://www.erzbistum-koeln.de/news/Digitale-christliche-Community-startet-an-Ostermontag/)
334. [eStudySource About](https://estudysource.com/about.aspx)
335. [Eternity News](https://www.eternitynews.com.au/world/the-bible-project-branches-out-with-new-app/)
336. [Eternity News](https://eternitynews.com.au/good-news/two-of-the-best-apps-to-fuel-your-prayers/)
337. [europe.ccli.com](https://europe.ccli.com/what-we-provide/?lang=de)
338. [Evangelical Focus](https://evangelicalfocus.com/life-tech/29263/philippians-46-the-most-shared-bible-verse-in-2024)
339. [evangelisch.de](https://www.evangelisch.de/inhalte/150140/23-05-2018/der-ekd-datenschutzbeauftragte-michael-jacob-ueber-die-dsgvo-und-die-eu-verordnung)
340. [evangelisch.de 18.08.2016](https://www.evangelisch.de/inhalte/137484/18-08-2016/ekd-verschenkt-neue-lutherbibel-als-kostenlose-app)
341. [evangelisch.de 11.10.2017](https://www.evangelisch.de/inhalte/146379/11-10-2017/lutherbibel-2017-app-der-bibelgesellschaft-bleibt-kostenlos)
342. [evangelisch.de 12.03.2021](https://www.evangelisch.de/inhalte/183640/12-03-2021/50000-aktive-nutzer-konfirmanden-app-bleibt-kostenlos-bibelgesellschaft-ekd)
343. [evangelisch.de 27.09.2021](https://www.evangelisch.de/inhalte/191170/27-09-2021/gottesdienst-studie-kirche-ist-digitaler-und-vielfaeltiger-geworden)
344. [evangelisch.de 16.10.2024](https://www.evangelisch.de/inhalte/235093/16-10-2024/shell-jugendstudie-2024-weniger-jugendliche-glauben-gott)
345. [evangelisch.de 29.09.2026: Passauer Theologen untersuchen KI-Gebets-App](https://www.evangelisch.de/inhalte/259533/29-09-2026/passauer-theologen-untersuchen-ki-gebets-app-hallow)
346. [evangelisch.de: Wie KI den Glauben verändert](https://www.evangelisch.de/inhalte/259541/29-09-2026/gebets-app-hallow-wie-ki-den-glauben-verandert)
347. [EWTN UK](https://ewtn.co.uk/article-hallow-apps-alex-jones-calls-liam-neeson-advent-partnership-a-mistake/)
348. [faith.tools: Bible App for Kids](https://faith.tools/app/23-bible-app-for-kids?category=bible)
349. [faith.tools: Dwell](https://faith.tools/app/18-dwell)
350. [faith.tools: BLB](https://faith.tools/app/83-blue-letter-bible?category=bible-study)
351. [faith.tools: Hallow](https://faith.tools/app/30-hallow)
352. [faith.tools: Glorify](https://faith.tools/app/48-glorify)
353. [faith.tools: Our Daily Bread](https://faith.tools/app/315-our-daily-bread)
354. [faith.tools: She Reads Truth](https://faith.tools/app/45-she-reads-truth?category=for-new-believers)
355. [Faith & Leadership: multiple churches](https://faithandleadership.com/many-churchgoers-are-engaging-multiple-churches-new-research-finds)
356. [Faith Blum 2013](https://faithblum.com/2013/09/18/christian-facebook-alternative/)
357. [FCBH](https://www.faithcomesbyhearing.com/audio-bible-resources/bible-is)
358. [FCBH Our Story](https://www.faithcomesbyhearing.com/about/our-story)
359. [Faithlife Transition FAQ](https://faithlife.com/transition-faq?ssi=0)
360. [Faithlife Fast Facts](https://faithlife.com/fast-facts)
361. [faithsocial.com (Abschiedsseite)](https://faithsocial.com/)
362. [feg.ch/apps](https://www.feg.ch/apps)
363. [feinschwarz.net](https://www.feinschwarz.net/die-6-kirchenmitgliedschaftsuntersuchung-ambivalente-ergebnisse/)
364. [Medium: Dwell Review](https://feketesteve.medium.com/trying-out-the-dwell-bible-app-an-in-depth-review-578487d685b0)
365. [FileHorse](https://www.filehorse.com/download-e-sword/)
366. [FinSMEs](https://www.finsmes.com/2021/12/glorify-raises-40m-in-series-a-funding.html)
367. [ForestVPN-Blog](https://forestvpn.com/en/blog/digital-privacy/youversion-bible-app-controversy/)
368. [Fortune 2022](https://fortune.com/2022/04/29/venture-capital-religious-metaverse-faith-based-startups/)
369. [Fortune 03.11.2021](https://fortune.com/2021/11/03/catholic-prayer-app-hallow-gets-40-million-in-funding)
370. [forum.church.tools](https://forum.church.tools/topic/5324/songselect)
371. [forum.songbeamer.de](https://forum.songbeamer.de/viewtopic.php?t=1983)
372. [forum.songbeamer.de](https://forum.songbeamer.de/viewtopic.php?t=3623)
373. [Accordance Forums: accordance 15 planned?](https://forums.accordancebible.com/topic/37578-accordance-15-planned/)
374. [Accordance Forums: State of the Company](https://forums.accordancebible.com/topic/33935-some-perspective-on-accordance-14-and-the-state-of-the-company/)
375. [Forward 2023](https://forward.com/culture/521336/gab-gabpay-paypal-andrew-torba-christian-nationalist/)
376. [fowid.de](https://fowid.de/meldung/religionsmonitor-2023)
377. [Fox Business Video](https://www.foxbusiness.com/video/6389531876112)
378. [Fox Business](https://www.foxbusiness.com/technology/text-jesus-app-draws-thousands-creator-says-ai-can-help-people-explore-scripture)
379. [Fox News 2007](https://www.foxnews.com/story/godtube-provides-christian-web-video-alternative.amp)
380. [Fox News](https://www.foxnews.com/lifestyle/hallow-prayer-app-accomplished-goal-gop-debate-company-pray-me-quick.amp)
381. [fransis.ai: Youth Group Texting Policies](https://www.fransis.ai/articles/youth-group-texting-policies)
382. [freshexpressions.de](https://freshexpressions.de/digitale-kirche/)
383. [FreshFire: Youth Group Communication Apps 2026](https://freshfire.app/best-youth-ministry-communication-apps-in-2026-which-platform-is-right-for-your-ministry/)
384. [Latka](https://getlatka.com/companies/pray.com)
385. [GetLatka](https://getlatka.com/companies/hallow.com)
386. [github.com/churchtools](https://github.com/churchtools)
387. [churchtools_basic](https://github.com/churchtools/churchtools_basic)
388. [GitHub stemaj/plugin.audio.hoerbibel](https://github.com/stemaj/plugin.audio.hoerbibel)
389. [GitHub Revisor01/ketiv](https://github.com/Revisor01/ketiv)
390. [GitHub hesstobi/herrnhuter-losung-widget](https://github.com/hesstobi/herrnhuter-losung-widget)
391. [GitHub mathisdt/bibleserver-scraper](https://github.com/mathisdt/bibleserver-scraper)
392. [GitHub fidpa/bibelstudium-mcp](https://github.com/fidpa/bibelstudium-mcp)
393. [GitHub deckerweb/daily-scripture](https://github.com/deckerweb/daily-scripture)
394. [GitHub scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases)
395. [GitHub gratis-bible/bible /de](https://github.com/gratis-bible/bible/tree/master/de)
396. [GitHub getbible/v2](https://github.com/getbible/v2)
397. [GitHub Offene-Bibel/offene-bibel.de](https://github.com/Offene-Bibel/offene-bibel.de)
398. [GitHub JXP1970/bibeltag](https://github.com/JXP1970/bibeltag)
399. [GitHub lwieske/lutherbibel2017-webcrawler](https://github.com/lwieske/lutherbibel2017-webcrawler)
400. [GitHub Castlepool/basisbibel-to-markdown](https://github.com/Castlepool/basisbibel-to-markdown)
401. [GitHub bibel/ELB2006](https://github.com/bibel/ELB2006)
402. [GitHub bibel/NeUe](https://github.com/bibel/NeUe)
403. [AndBible #1239](https://github.com/AndBible/and-bible/issues/1239)
404. [AndBible #1163](https://github.com/AndBible/and-bible/issues/1163)
405. [AndBible #1071](https://github.com/AndBible/and-bible/issues/1071)
406. [AndBible #184](https://github.com/AndBible/and-bible/issues/184)
407. [AndBible #771](https://github.com/AndBible/and-bible/issues/771)
408. [AndBible #3590](https://github.com/AndBible/and-bible/issues/3590)
409. [AndBible #252](https://github.com/AndBible/and-bible/issues/252)
410. [AndBible #154](https://github.com/AndBible/and-bible/issues/154)
411. [AndBible #188](https://github.com/AndBible/and-bible/issues/188)
412. [AndBible #1609](https://github.com/AndBible/and-bible/issues/1609)
413. [AndBible #1602](https://github.com/AndBible/and-bible/issues/1602)
414. [Repo](https://github.com/mattrob33/christian-projects)
415. [Repo](https://github.com/servusdei2018/awesome-catholic)
416. [AndBible #3808](https://github.com/AndBible/and-bible/issues/3808)
417. [AndBible #3809](https://github.com/AndBible/and-bible/issues/3809)
418. [GitLab: free-offene-bibel-converter](https://gitlab.com/freie-bibel/free-offene-bibel-converter)
419. [Gitnux](https://gitnux.org/church-management-software-industry-statistics/)
420. [Gizmodo](https://gizmodo.com/jesus-christ-the-rise-of-ai-for-talking-to-god-2000641940)
421. [GlobeNewswire, 9. März 2026](https://www.globenewswire.com/news-release/2026/03/09/3251986/0/en/pushpay-and-barna-group-s-2026-state-of-church-technology-report-shows-church-tech-has-moved-past-adoption-now-alignment-is-what-matters.html)
422. [GlobeNewswire, 30. April 2025](https://www.globenewswire.com/news-release/2025/04/30/3071371/0/en/pushpay-s-2025-state-of-church-tech-report-reveals-digital-tools-are-strengthening-faith-fueling-connection-and-shaping-the-future-of-ministry.html)
423. [GlobeNewswire 2024](https://www.globenewswire.com/news-release/2024/02/27/2836082/0/en/New-Pushpay-Study-Reveals-Increased-Technology-Adoption-Among-Catholic-Churches-Hybrid-Worship-Mobile-Giving-and-Digital-Security-are-Top-Priorities.html)
424. [Gloo: State of the Church](https://gloo.com/our-brands/state-of-the-church)
425. [Glorify Zendesk: Why do I have to pay](https://glorify-app.zendesk.com/hc/en-gb/articles/360020071740-Why-do-I-have-to-pay-to-use-Glorify)
426. [glorify.global/ring](https://www.glorify.global/ring)
427. [GodSquad Church](https://www.godsquadchurch.com/discord)
428. [Grokipedia: Dwell](https://grokipedia.com/page/Dwell_app)
429. [Growth Case Study](https://growthcasestudies.com/p/youversion)
430. [Grow with Plutus](https://growwithplutus.com/blog/hallow-app-strategy-breakdown)
431. [GuideStar](https://www.guidestar.org/profile/85-0223225)
432. [SCM Händlerportal](https://haendlerportal.scm-verlagsgruppe.de/musik/noten.html)
433. [Hallow Blog: 1 Billion Prayers](https://hallow.com/blog/hallow-celebrates-1-billion-prayers-prayed/)
434. [Hallow Pray40](https://hallow.com/pray40/)
435. [Hallow #1 App Store](https://hallow.com/blog/hallow-makes-history-taking-no-1-spot-in-app-store/)
436. [Hallow Blog: Series B](https://hallow.com/blog/series-b-1-million-downloads-25-million-prayers/)
437. [Hallow Blog: 10 Million Installs & Series C](https://hallow.com/blog/10-million-installs/)
438. [Why do we charge for Hallow Plus](https://hallow.com/blog/why-do-we-charge-for-hallow-plus/)
439. [hallow.com/de](https://hallow.com/de/)
440. [hallow.com/features](https://hallow.com/features/)
441. [Hartford: Churches rebounded](https://www.hartfordinternational.edu/news-events/news/hirr-study-shows-how-us-churches-have-rebounded-pandemic)
442. [BibleProject Help](https://help.bibleproject.com/hc/en-us/articles/4478975400727-I-m-new-to-the-app-How-do-I-get-started)
443. [help.eduki.com](https://help.eduki.com/hc/de/articles/4403780887058-Welche-Bibeltexte-darf-ich-in-meinen-Materialien-verwenden)
444. [Gloo Help: ChurchPulse](https://help.gloo.us/en/articles/10860240-state-of-the-church-churchpulse)
445. [help.hallow.com: Subscription cost](https://help.hallow.com/en/articles/2880438-how-much-does-the-subscription-cost)
446. [help.hallow.com: Friends & Family](https://help.hallow.com/en/articles/8792413-how-to-purchase-or-upgrade-to-the-friends-and-family-plan)
447. [help.hallow.com: Languages](https://help.hallow.com/en/articles/4334078-are-you-available-in-other-languages)
448. [help.hallow.com: free version](https://help.hallow.com/en/articles/3279868-how-do-i-access-the-free-version-of-the-app)
449. [help.hallow.com: Magisterium AI FAQ](https://help.hallow.com/en/articles/10601094-magisterium-ai-faq)
450. [help.hallow.com: Hallow AI FAQ](https://help.hallow.com/en/articles/13601993-hallow-ai-faq)
451. [Olive Tree Help: Manage Subscriptions](https://help.olivetree.com/hc/en-us/articles/360052842371-Manage-Subscriptions)
452. [help.pray.com: Subscription Plans](https://help.pray.com/hc/en-us/articles/15255693841565-Pray-com-Subscription-Plans)
453. [help.pray.com: Is Pray.com free?](https://help.pray.com/hc/en-us/articles/4416621897105-Is-Pray-com-free)
454. [YouVersion Support: Privacy for Friendships (Android)](https://help.youversion.com/l/en/article/rt62acx7ei-privacy-for-bible-app-friendships)
455. [Plan Privacy](https://help.youversion.com/l/en/article/8cmc1jj49w-plan-privacy-android)
456. [YouVersion Support: Plans with Friends](https://help.youversion.com/l/en/search/plan%20with%20friends)
457. [YouVersion Help](https://help.youversion.com/l/en/article/bdgy3q6m3k-share-a-prayer-with-friends-on-android)
458. [Herder Korrespondenz 12/2024](https://www.herder.de/hk/hefte/archiv/2024/12-2024/glaube-an-gott-verliert-bei-jungen-katholiken-an-relevanz-shell-jugendstudie-2024/)
459. [CIG 43/2024](https://www.herder.de/cig/cig-ausgaben/archiv/2024/43-2024/pragmatisch-positiv-areligioes-shell-jugendstudie-vorgestellt/)
460. [herder.de](https://www.herder.de/communio/kolumnen/hartl-aber-herzlich/hallow-app-und-christliche-influencer-in-der-kritik-kontaktschuld/)
461. [herzblatt-journal.com](https://herzblatt-journal.com/blog/christ-sucht-christ-test-erfahrungen/)
462. [HM Magazine](https://hmmagazine.com/daily-audio-bible-a-popular-podcast/)
463. [HolyJot: Best AI Devotional Apps 2026](https://www.holyjot.com/blog/ai-devotional-apps-review)
464. [Hope 103.2](https://hope1032.com.au/parenting/youversion-bible-app-child-safety-vulnerability-exposed/)
465. [Hope 103.2](https://hope1032.com.au/news/ups-and-downs-the-fascinating-mood-tracking-findings-of-christian-meditation-app-soultime/)
466. [hpd.de](https://hpd.de/artikel/shell-jugendstudie-2024-kirchen-nicht-vertrauenswuerdig-22552)
467. [hpd.de: Besser beten mit der Hallow-App](https://hpd.de/artikel/besser-beten-hallow-app-23027)
468. [Pushpay Hub](https://hub.pushpay.com/state-of-church-technology/)
469. [IBTimes UK](https://www.ibtimes.co.uk/hallow-app-controversy-why-some-users-call-it-money-grab-why-its-banned-some-countries-1738240)
470. [idea.de: „Eine Milliarde Downloads"](https://www.idea.de/artikel/eine-milliarde-downloads-bibel-app-youversion-feiert-rekord)
471. [idea.de (DE)](https://www.idea.de/artikel/youversion-gruender-ki-zitiert-die-bibel-oft-falsch)
472. [idea.de](https://www.idea.de/artikel/bibel-app-youversion-ueber-800-millionen-downloads)
473. [Notre Dame IDEA Center](https://ideacenter.nd.edu/news-events/news/notre-dame-alumnus-secured-a-50-million-series-c-fund/)
474. [@hallowapp.de](https://www.instagram.com/hallowapp.de/)
475. [OIDAC Europe Fallakte](https://www.intoleranceagainstchristians.eu/index.php?id=12&case=9313)
476. [Inverse/Input](https://www.inverse.com/input/culture/prayer-apps-sell-data-to-tech-facebook-personalize-ads)
477. [Apple App Store (Die-Bibel.de)](https://itunes.apple.com/us/app/lutherbibel-2017/id1151790560?mt=8)
478. [jesus.ch](https://www.jesus.ch/themen/kirche_und_co/christliches_gemeindeleben/musik_und_lobpreis/know_how/184163-15000_christliche_songs_online_verfuegbar.html)
479. [jesus.de](https://www.jesus.de/nachrichten-themen/bibel-app-youversion-erreicht-800-millionen-downloads/)
480. [jesus.de](https://www.jesus.de/nachrichten-themen/weitere-meldungen/youversion-bibel-app-400-millionen-mal-installiert/)
481. [jesus.de](https://www.jesus.de/nachrichten-themen/jugendstudie-religion-verliert-fuer-christliche-jugendliche-an-bedeutung/)
482. [Journey Church](https://www.journeychurchsc.org/discord)
483. [Jovo: Why churches outgrow WhatsApp – 7 risks](https://www.jovoapp.com/en-us/blog/why-churches-outgrow-whatsapp---7-risks-and-fixes)
484. [Joyful Life Magazine](https://joyfullifemagazine.com/dwell-app-review/)
485. [juenger.my.canva.site/kmu](https://juenger.my.canva.site/kmu)
486. [JustUseApp](https://justuseapp.com/en/app/1490587079/glorify-daily-worship/reviews)
487. [JustUseApp: Dwell Reviews](https://justuseapp.com/en/app/1343917374/dwell-audio-bible/reviews)
488. [kath.ch](https://www.kath.ch/christliche-apps/)
489. [kath.ch](https://www.kath.ch/newsd/gebets-app-hallow-erneut-in-der-kritik-wegen-us-moderator/)
490. [katholisch.at/Kathpress](https://www.katholisch.at/aktuelles/155414/theologe-schlaegt-vatikanisches-pruefsiegel-fuer-katholische-apps-vor)
491. [katholisch.at: Heiligenkreuzer Mönche in Hallow](https://www.katholisch.at/aktuelles/146825/heiligenkreuzer-moenche-in-gebets-app-hallow-vertreten)
492. [katholisch.de: Hallow zwischen Glauben, Geld und Macht](https://katholisch.de/artikel/66536-gebetsapp-hallow-zwischen-glauben-geld-und-macht)
493. [katholisch.de 56435](https://katholisch.de/artikel/56435-welche-rolle-spielt-die-gebetsapp-hallow-bei-den-us-wahlen)
494. [katholisch.de 67404](https://katholisch.de/artikel/67404-gebets-app-hallow-erneut-in-kritik-wegen-umstrittenem-moderator)
495. [katholisch.de 66329](https://katholisch.de/artikel/66329-kritik-an-adventskampagne-promis-unterstuetzen-hallow-app)
496. [Kathpress](https://www.kathpress.at/goto/meldung/2557166/gebets-app-hallow-erneut-in-der-kritik-wegen-us-moderator)
497. [Kathpress](https://www.kathpress.at/goto/meldung/2616675/forscher-wollen-gebets-app-hallow-wissenschaftlich-untersuchen)
498. [Keep The Faith, 4.11.2025](https://www.keepthefaith.co.uk/2025/11/04/bible-app-creators-youversion-reach-1-billion-app-installs/)
499. [Kevin Purcell](https://www.kevinpurcell.org/blog/the-new-logos-subscription-model-and-how-to-save-money)
500. [Kevin Purcell: Logos Hears Outcry](https://kevinpurcell.org/logos-hears-outcry-reneges-on-shelving-logos-now-mostly/)
501. [Kevin Purcell: Insights Sidebar](https://www.kevinpurcell.org/new-logos-insights-sidebar-with-ai-for-logos-pro-users/)
502. [kirchenzeitung.at](https://www.kirchenzeitung.at/site/kirche/weltkirche/das-geschaeft-mit-dem-amen-die-hallow-app)
503. [Kirk Miller Blog 2019](https://kirkmillerblog.com/2019/07/07/dwell-a-scripture-listening-app/)
504. [K-LOVE](https://www.klove.com/faith/news/faith/bible-app-for-kids-hits-100m-installs-worldwide-families-learn-the-bible-together-42328)
505. [kmu.ekd.de](https://kmu.ekd.de/)
506. [KMU6 EVA-Auswertung (PDF)](https://kmu.ekd.de/fileadmin/user_upload/kirchenmitgliedschaftsuntersuchung/PDF/KMU6_Auswertung_EVA_2024_WEB_FINAL.pdf)
507. [Knowable Word](https://www.knowableword.com/2024/11/22/logos-bible-software-more-affordable-than-ever/)
508. [kommunal.de](https://kommunal.de/whatsapp-alternativen)
509. [kontrast.at](https://kontrast.at/katholische-gebets-app-hallow-stars/)
510. [KTVU/Fox](https://www.ktvu.com/news/text-jesus-ai-chatbot-app-grows-rapidly-despite-criticism)
511. [LA Business Journal 2020](https://labusinessjournal.com/news/2020/apr/13/praycom-answers-call-digital-faithful)
512. [LA Catholics 01.04.2026](https://lacatholics.org/2026/04/01/catholic-church-sees-massive-growth-in-new-members-in-2026/)
513. [LeadIQ](https://leadiq.com/c/faithlife-logos-bible-software/5a1d97212300005b0085b82e)
514. [Learn of Christ: YouVersion Review](https://learnofchrist.com/resources/youversion)
515. [Learn of Christ: Olive Tree](https://learnofchrist.com/resources/olive-tree)
516. [Learn of Christ: BLB](https://learnofchrist.com/resources/blue-letter-bible)
517. [Learn of Christ: Glorify](https://learnofchrist.com/resources/glorify)
518. [Learn of Christ: Accordance](https://learnofchrist.com/resources/accordance)
519. [Learn of Christ: Bible Hub](https://learnofchrist.com/resources/bible-hub)
520. [Learn of Christ: Faithlife](https://learnofchrist.com/resources/faithlife)
521. [Learn of Christ: Bible Chat](https://learnofchrist.com/resources/bible-chat)
522. [Learn of Christ: e-Sword](https://learnofchrist.com/resources/e-sword)
523. [Learn of Christ: Bible Hub App](https://learnofchrist.com/resources/bible-hub-app)
524. [learnofchrist.com GodTube Review 2026](https://learnofchrist.com/resources/godtube)
525. [learnofchrist: Planning Center Review 2026](https://learnofchrist.com/resources/planning-center)
526. [learnofchrist Review 2026](https://learnofchrist.com/resources/church-online-platform)
527. [learnofchrist: Hallow Review 2026](https://learnofchrist.com/resources/hallow)
528. [learnofchrist: Pray.com Review 2026](https://learnofchrist.com/resources/pray-com)
529. [learnofchrist: Abide Review 2026](https://learnofchrist.com/resources/abide)
530. [learnofchrist: Lectio 365 Review 2026](https://learnofchrist.com/resources/lectio-365)
531. [learnofchrist: First 5 Review 2026](https://learnofchrist.com/resources/first-5)
532. [learnofchrist: DAB Review 2026](https://learnofchrist.com/resources/daily-audio-bible)
533. [learnofchrist: Soultime Review 2026](https://learnofchrist.com/resources/soultime)
534. [lectio365.com/keep-free](https://lectio365.com/keep-free/)
535. [lectio365.com/give](https://lectio365.com/give/)
536. [lectio365.com/the-app](https://lectio365.com/the-app/)
537. [link.springer.com](https://link.springer.com/article/10.1007/s41682-023-00149-0)
538. [ListenNotes](https://www.listennotes.com/podcasts/1-year-daily-audio-bible-brian-hardin-PXtBuGg3v4Q/)
539. [LitNet: Studie](https://www.litnet.co.za/artificial-intelligence-jesus-chatbots-challenge-for-theology-an-exploratory-study/)
540. [Livenet.ch](https://www.livenet.ch/themen/glaube/bibel/243635-youversion_mit_ueber_200_millionen_downloads.html)
541. [Logos: Updates to Strategic Direction](https://www.logos.com/grow/faithlife-strategic-direction-moving-forward/)
542. [losungen.de/digital/app](https://www.losungen.de/digital/app)
543. [losungen.de/download](https://www.losungen.de/download)
544. [losungen.de (PDF)](https://www.losungen.de/fileadmin/media-losungen/download/NUTZUNGSBEDINGUNGEN_Januar_2017.pdf)
545. [magisterium.com](https://www.magisterium.com/)
546. [Market Research Future](https://www.marketresearchfuture.com/reports/church-management-software-market-23745)
547. [Matt Dabbs Review, 30.12.2024](https://mattdabbs.com/2024/12/30/review-of-logos-bible-software-subscription-service/)
548. [MediaPost: Guideposts acquires Abide](https://www.mediapost.com/publications/article/368076/guideposts-acquires-abide-christian-prayer-app.html?edition=124085)
549. [Medienkompass](https://www.medienkompass.de/churchtools-eine-datenschutzkonforme-kommunikationsplattform-fuer-gemeinden)
550. [mi-di.de/aktuelles](https://www.mi-di.de/aktuelles)
551. [miheret.substack.com](https://miheret.substack.com/p/youversion-billion-installs-platform-strategy)
552. [MinistryWatch: Rapid Growth](https://ministrywatch.com/bibleproject-experiences-rapid-growth-going-into-seventh-year/)
553. [MinistryWatch Spotlight](https://ministrywatch.com/ministry-spotlight-the-bible-project/)
554. [MinistryWatch](https://ministrywatch.com/the-new-church-tech-divide-is-missional-not-digital/)
555. [Monk Development](https://www.monkdevelopment.com/ekklesia-360/)
556. [Mozilla *Privacy Not Included: Hallow](https://www.mozillafoundation.org/en/privacynotincluded/hallow/)
557. [Mozilla: Pray.com](https://www.mozillafoundation.org/en/privacynotincluded/praycom/)
558. [Mozilla Blog](https://www.mozillafoundation.org/en/blog/top-mental-health-and-prayer-apps-fail-spectacularly-at-privacy-security/)
559. [mwm.ai: Glorify](https://mwm.ai/apps/glorify-devotional-prayer/1490587079)
560. [mwm.ai Statistik](https://mwm.ai/apps/the-chosen/6443956656)
561. [mwm.ai](https://mwm.ai/apps/die-losungen/685358790)
562. [National Technology UK](https://www.nationaltechnology.co.uk/London_Based_Christian_Subscription_App_Raises_40m.php)
563. [National Law Review (PR)](https://natlawreview.com/press-releases/glorify-and-confidein-merge-form-category-defining-faith-tech-company)
564. [NBC Washington](https://www.nbcwashington.com/news/tech/religious-chatbot-apps/4016079/)
565. [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10054190/)
566. [NCRegister/CNA](https://www.ncregister.com/cna/catholic-prayer-app-hallow-to-air-commercial-during-super-bowl-lviii)
567. [NCRegister: Jones calls Neeson partnership 'mistake'](https://www.ncregister.com/news/hallow-apps-alex-jones-calls-neeson-partnership-mistake)
568. [NCRegister/CNA: Hallow defends partnership](https://www.ncregister.com/cna/hallow-app-defends-partnership-with-liam-neeson-a-supporter-of-abortion)
569. [NCR: More than a Hail Mary pass](https://www.ncronline.org/news/more-hail-mary-pass-prayer-apps-ad-aims-bring-devotion-super-bowl)
570. [NCR](https://www.ncronline.org/news/prayer-app-hallow-faces-backlash-over-lenten-partnership-tucker-carlson)
571. [The New Republic](https://newrepublic.com/article/163285/andrew-torba-gab-white-christian-internet)
572. [Lifeway News: Doubts (April 2026)](https://news.lifeway.com/2026/04/07/lifeway-research-finds-growing-number-of-churchgoers-face-doubts/)
573. [Yahoo/TechCrunch](https://news.yahoo.com/hallow-religious-app-catholics-talks-202345783.html)
574. [NewsNation](https://www.newsnationnow.com/religion/hallow-prayer-app-climbs-no-1-free-app-apple/)
575. [Newswire](https://www.newswire.com/news/pray-com-first-religious-app-to-reach-100-million-podcast-downloads-2-22425087)
576. [Niche Pursuits](https://www.nichepursuits.com/bible-gateway-success-story/)
577. [nicolai-lemgo.de](https://www.nicolai-lemgo.de/b/neue-bibel-apps-erschienen-207621)
578. [Nordic9](https://nordic9.com/news/glorify-raised-40-million-in-series-b-funding-led-by-softbank-latin-american-fund/)
579. [nordkirche.de](https://www.nordkirche.de/nachrichten/nachrichten-detail/nachricht/welche-digitalen-formate-der-verkuendigung-hat-die-corona-krise-hervorgebracht)
580. [nordkirche.de (Online-Gottesdienste beliebt)](https://www.nordkirche.de/nachrichten/nachrichten-detail/nachricht/online-gottesdienste-auch-nach-ende-des-lockdowns-beliebt)
581. [NPR 1A 10.02.2022](https://www.npr.org/2022/02/10/1079944694/what-we-can-learn-about-privacy-from-faith-based-apps)
582. [NZZ: Gott und das Silicon Valley](https://www.nzz.ch/meinung/gott-und-das-silicon-valley-wie-die-tech-milliardaere-die-menschheit-erloesen-wollen-ld.1891608)
583. [oer.community](https://oer.community/ist-die-bibel-eigentlich-open/)
584. [offene-bibel.de „Unsere Ziele“](https://offene-bibel.de/wiki/Unsere_Ziele)
585. [oikos-projekt.org](https://oikos-projekt.org/)
586. [olivetree.com](https://www.olivetree.com/)
587. [Olive Tree Pressemitteilung 11.9.2020](https://www.olivetree.com/press/pressrelease09112020.php)
588. [Open Life.Church Curriculum](https://open.life.church/preschool)
589. [Life.Church Open](https://open.life.church/resources/3488-plans-with-friends)
590. [openpr.de](https://www.openpr.de/news/923786/Lutherbibel-2017-als-kostenlose-App-zum-Download.html)
591. [Outreach Magazine](https://outreachmagazine.com/resources/76039-bible-app-for-kids-celebrates-100-million-installs-worldwide.html)
592. [OverviewBible: Logos Free](https://overviewbible.com/logos-bible-software-free-basic/)
593. [Owler](https://www.owler.com/company/logosbiblesoftware)
594. [Owler](https://www.owler.com/company/prayinc)
595. [parental-control.net](https://parental-control.net/en/blog/article/telegram-or-discord-for-teens-risks-safety-and-parental-control)
596. [Patheos](https://www.patheos.com/blogs/electiadeoexperience/2025/11/global-bible-month-reaching-over-1-billion-souls-digitally/)
597. [Patheos: Bible Gateway Plus](https://www.patheos.com/blogs/leadaquietlife/2025/04/bible-study-essentials-bible-gateway-plus/)
598. [International Christian Concern 29.01.2025](https://persecution.org/2025/01/29/christian-prayer-app-hallow-banned-in-europe/)
599. [Pew Research 2023](https://www.pewresearch.org/religion/2023/06/02/online-religious-services-appeal-to-many-americans-but-going-in-person-remains-more-popular/)
600. [Pew RLS: Attendance & Involvement](https://www.pewresearch.org/religion/2025/02/26/religious-attendance-and-congregational-involvement/)
601. [Pew RLS Report PDF](https://www.pewresearch.org/wp-content/uploads/sites/20/2025/02/PR_2025.02.26_religious-landscape-study_report.pdf)
602. [Pew 2023 Report PDF](https://www.pewresearch.org/wp-content/uploads/sites/20/2023/06/PF_2023.06.02_religion-online_REPORT.pdf)
603. [pewresearch.org (vermutete Quelle aus Vorwissen, unverifiziert)](https://www.pewresearch.org/religion/2025/02/26/decline-of-christianity-in-the-us-has-slowed-may-have-leveled-off/)
604. [The Pillar](https://www.pillarcatholic.com/p/hallow-app-to-wait-and-see-over-possible)
605. [PitchBook: Tithe.ly](https://pitchbook.com/profiles/company/118536-31)
606. [PitchBook](https://pitchbook.com/profiles/company/171663-94)
607. [Google Play: Logos](https://play.google.com/store/apps/details?id=com.logos.androidlogos&hl=en_US)
608. [Google Play: Bible.is](https://play.google.com/store/apps/details?id=com.faithcomesbyhearing.android.bibleis&hl=en_US)
609. [Google Play: BibleProject](https://play.google.com/store/apps/details?id=com.bibleproject&hl=en_US)
610. [Google Play: Hosanna](https://play.google.com/store/apps/details?id=com.fcbh.polybible&hl=en_US)
611. [Google Play: Dwell](https://play.google.com/store/apps/details?id=com.dwellapp.dwell&hl=en_US)
612. [Google Play: Rick Meyers](https://play.google.com/store/apps/dev?id=9170911837238057822&hl=en_US)
613. [MCSN auf Google Play](https://play.google.com/store/apps/details?id=com.wghdfmapp&hl=en_US)
614. [Google Play: RightNow Media](https://play.google.com/store/apps/details?id=com.rightnowmedia.rightnowmedia&hl=en_US)
615. [Google Play](https://play.google.com/store/apps/details?id=de.dbg.bibel&hl=en-US)
616. [Google Play Schlachter](https://play.google.com/store/apps/details?id=bible.DE.SCH2000&hl=en_US)
617. [Google Play Audio Schlachter](https://play.google.com/store/apps/details?id=com.dcpf.ger.ntv&hl=en_US)
618. [Google Play Studienbibel](https://play.google.com/store/apps/details?id=air.com.SBG.sCHL2&hl=en_US)
619. [Google Play Elberfelder](https://play.google.com/store/apps/details?id=elberfelder.die.bibel.deutsch&hl=en_US)
620. [Google Play Die Bibel Deutsch](https://play.google.com/store/apps/details?id=die.bibel.deutsch.kostenlos&hl=en_US)
621. [Google Play](https://play.google.com/store/apps/details?id=dbg.de.konapp&hl=en_US)
622. [Google Play Eden](https://play.google.com/store/apps/details?id=com.eden_android&hl=en_US)
623. [Google Play: Abide](https://play.google.com/store/apps/details?id=is.abide&hl=en_US&gl=US)
624. [Google Play: Lectio 365](https://play.google.com/store/apps/details?id=com.prayer247.lectio365&hl=en_US)
625. [Google Play: Echo](https://play.google.com/store/apps/details?id=com.cloversites.echo&hl=en_US)
626. [Google Play: He Reads Truth](https://play.google.com/store/apps/details?id=com.shereadstruth.hereadstruth&hl=en_US)
627. [Google Play: Soultime](https://play.google.com/store/apps/details?id=com.soultime.app&hl=en_US)
628. [Pray.com: Founders](https://www.pray.com/articles/founders)
629. [Pray.com Family](https://www.pray.com/family/)
630. [Premier Christian News](https://premierchristian.news/en/news/article/youversion-ceo-warns-ai-misquotes-scripture)
631. [Premier Christian News](https://premierchristian.news/us/news/article/catholic-prayer-app-hallow-faces-potential-eu-ban)
632. [EKiR-Presse](https://presse.ekir.de/presse/DF839B2CED9F47FB8C89C97FE962B1F4/aktuelle-studien-zeigen-kirche-ist-digitaler-geworden)
633. [PR Newswire, Verse of the Year 2025](https://www.prnewswire.com/news-releases/youversion-announces-2025-verse-of-the-year-as-bible-engagement-reaches-new-heights-globally-302632694.html)
634. [PR Newswire 2024](https://www.prnewswire.com/news-releases/youversions-verse-of-the-year-reflects-global-trend-of-seeking-peace-through-prayer-302316829.html)
635. [Launch-PR 2020](https://www.prnewswire.com/news-releases/faithsocial-brings-together-the-worldwide-christian-community-with-creation-of-an-online-social-media-digital-platform-301078762.html)
636. [PRO Medienmagazin](https://www.pro-medienmagazin.de/diese-christlichen-apps-lohnen-sich-ios-iphone-android-youversion/)
637. [pro-medienmagazin.de](https://www.pro-medienmagazin.de/bibel-app-youversion-ruft-zur-30-tage-bibel-challenge-auf/)
638. [Proverbs 31 Ministries](https://proverbs31.org/)
639. [PRWeb Pressemitteilung](https://www.prweb.com/releases/catholic-app-hallow-passes-1-million-downloads-raises-40-million-series-b-to-help-christians-around-the-world-find-peace-889071097.html)
640. [psalmo.app Review](https://psalmo.app/blog/youversion-app-review)
641. [Publishers Weekly 2014](https://www.publishersweekly.com/pw/by-topic/industry-news/religion/article/62160-harper-acquires-bible-software-company.html)
642. [Puritan Board](https://puritanboard.com/threads/logos-is-switching-to-subscription-based-features.114291/)
643. [Purpose Nation Interview Ahlsten](https://www.purposenation.org/neil-ahlsten-abide-transcript)
644. [Pushpay Blog: What 2025 revealed](https://pushpay.com/blog/what-2025-revealed-about-church-engagement/)
645. [GitHub: christian-projects README](https://raw.githubusercontent.com/mattrob33/christian-projects/main/README.md)
646. [awesome-catholic README](https://raw.githubusercontent.com/servusdei2018/awesome-catholic/master/README.md)
647. [B1Mobile README](https://raw.githubusercontent.com/ChurchApps/B1Mobile/main/README.md)
648. [awesome-bible-developer-resources README](https://raw.githubusercontent.com/biblenerd/awesome-bible-developer-resources/main/README.md)
649. [thiagobodruk/bible README](https://raw.githubusercontent.com/thiagobodruk/bible/master/README.md)
650. [awesome-bible-data README](https://raw.githubusercontent.com/jcuenod/awesome-bible-data/main/README.md)
651. [platform-sdk-react README](https://raw.githubusercontent.com/youversion/platform-sdk-react/main/README.md)
652. [AndBible README](https://raw.githubusercontent.com/AndBible/and-bible/master/README.md)
653. [Benchmark README](https://raw.githubusercontent.com/youversion/biblelab-bible-accuracy-benchmark/main/README.md)
654. [platform-skills README](https://raw.githubusercontent.com/youversion/platform-skills/main/README.md)
655. [Raw Story](https://www.rawstory.com/hallow-app/)
656. [rbc-odb.andro.io](https://rbc-odb.andro.io/)
657. [Reach Right](https://reachrightstudios.com/blog/planning-center-review/)
658. [registry.npmjs.org/losungen](https://registry.npmjs.org/losungen)
659. [npm-Suche „losungen“](https://registry.npmjs.org/-/v1/search?text=losungen&size=20)
660. [npm-Registry: free-use-bible-api](https://registry.npmjs.org/free-use-bible-api)
661. [npm-Suche „bible"](https://registry.npmjs.org/-/v1/search?text=bible&size=30&popularity=1.0)
662. [npm-Suche „youversion"](https://registry.npmjs.org/-/v1/search?text=youversion&size=20)
663. [npm-Suche „bibel"](https://registry.npmjs.org/-/v1/search?text=bibel&size=20)
664. [religion.ORF.at](https://religion.orf.at/stories/3227157/)
665. [religion.ORF.at: Gebetsapps mit Haken](https://religion.orf.at/stories/3232866/)
666. [Religion News Service 23.02.2026](https://religionnews.com/2026/02/23/prayer-app-hallow-faces-backlash-over-lenten-partnership-with-tucker-carlson/)
667. [Contrary Research: Hallow](https://research.contrary.com/company/hallow)
668. [Lifeway Research, März 2025](https://research.lifeway.com/2025/03/31/2-tech-changes-that-can-increase-giving/)
669. [Lifeway: Post-Pandemic Shift in Evangelical Engagement (Aug. 2024)](https://research.lifeway.com/2024/08/26/the-post-pandemic-shift-in-evangelical-church-engagement/)
670. [Lifeway: Church Attendance Increases (Mai 2026)](https://research.lifeway.com/2026/05/01/church-attendance-increases-for-the-first-time-in-decades/)
671. [Lifeway: Pastors Report Growing Attendance (Sept. 2026)](https://research.lifeway.com/2026/09/01/pastors-report-growing-attendance-but-fewer-unchurched-newcomers/)
672. [Lifeway: Half of Churches Growing (März 2025)](https://research.lifeway.com/2025/03/18/half-of-churches-experiencing-post-pandemic-attendance-growth/)
673. [Lifeway: Pastors, Churchgoers See AI as Concerning (April 2026)](https://research.lifeway.com/2026/04/21/pastors-churchgoers-see-ai-as-concerning-and-confusing/)
674. [Lifeway: 10 Trends 2024](https://research.lifeway.com/2024/01/12/10-trends-impacting-the-church-in-2024/)
675. [research.lifeway.com (vermutete Quelle aus Vorwissen, unverifiziert)](https://research.lifeway.com/)
676. [Concordia Technology: Should your church use GroupMe?](https://resources.concordiatechnology.org/communication/should-your-church-use-the-messaging-app-groupme)
677. [RevenueMemo: Who owns Hallow (2026)](https://www.revenuememo.com/p/who-owns-hallow)
678. [RightNow Media App Features](https://www.rightnowmedia.org/us/app-features)
679. [rightnowmedia.org](https://www.rightnowmedia.org/)
680. [Rio Times](https://www.riotimesonline.com/brazil-news/faith/eu-regulations-threaten-hallows-prayer-app-amid-rising-digital-control/)
681. [Rise 96.5](https://rise965.com/technology/youversion-bible-app-child-safety-vulnerability-exposed/)
682. [RNA Pressemitteilung](https://rna.org/paid-press-releases/new-research-highlights-trends-in-gen-z-mental-health)
683. [Rob Hoskins/OneHope](https://robhoskins.onehope.net/this-changes-everything-bible-app-for-kids/)
684. [Rome Reports 13.02.2024](https://www.romereports.com/en/2024/02/13/catholic-prayer-app-airs-superbowl-ad-reaches-100-million-people/)
685. [scriptureverse.app Pricing](https://www.scriptureverse.app/blog/accordance-bible-software-pricing-is-it-worth-it)
686. [SelectHub](https://www.selecthub.com/p/church-management-software/planning-center/)
687. [Seth Muse: Team Communications Tools for Churches](https://www.sethmuse.com/team-communications-tools-for-churches/)
688. [Diocese of Sheffield Guidance 2024 (PDF)](https://www.sheffield.anglican.org/wp-content/uploads/2024/07/Children-young-people-social-media-guidance.pdf)
689. [shop.die-bibel.de Digitale Bibeln](https://shop.die-bibel.de/Bibeln/Digitale-Bibeln/)
690. [Mehrplatzlizenzen](https://shop.die-bibel.de/Kundenservice/Produkt-Support/Mehrplatzlizenzen/)
691. [Slate Feb. 2024](https://slate.com/human-interest/2024/02/super-bowl-commercials-ads-mark-wahlberg-hallow-prayer-app.html)
692. [Slate 2025](https://slate.com/life/2025/04/mark-wahlberg-hallow-prayer-app-review.html)
693. [Small Church Ministry: 7 Best Apps for Youth Ministry Communication](https://smallchurchministry.com/apps-for-youth-ministry-communication/)
694. [Small Group Network](https://smallgroupnetwork.com/better-connect-groups-using-youversion-bible-app/)
695. [SmartCustomer](https://www.smartcustomer.com/reviews/biblegateway.com)
696. [SociableBlog 2007](https://www.sociableblog.com/2007/11/09/xianz-christian-social-networking-site-to-go-public/)
697. [SocialMediaToday 2015](https://www.socialmediatoday.com/social-networks/adhutchinson/2015-07-07/facegloria-sin-free-facebook-alternative-built-christian)
698. [socie.de](https://socie.de/kirchen-app/)
699. [Software Advice](https://www.softwareadvice.com/worship/logos-bible-software-profile/)
700. [Softwr Pricing](https://www.softwr.com/pricing/bible-gateway)
701. [Sojourners](https://sojo.net/magazine/april-2024/culture/pastor-chats-ai-jesus)
702. [Sonntagsblatt „Medientipps: Gemeinde-Apps für Kirchen“](https://www.sonntagsblatt.de/medientipps-gemeinde-apps-kirche-digitalekirche)
703. [Sonntagsblatt/epd](https://www.sonntagsblatt.de/artikel/epd/passauer-theologen-untersuchen-ki-gebets-app-hallow)
704. [sotb.research.bible (vermutete Quelle aus Vorwissen, unverifiziert)](https://sotb.research.bible/)
705. [SourceForge zefania-sharp](https://sourceforge.net/projects/zefania-sharp/)
706. [GER-Ordner](https://sourceforge.net/projects/zefania-sharp/files/Bibles/GER/)
707. [Lutherbibel](https://sourceforge.net/projects/zefania-sharp/files/Bibles/GER/Lutherbibel/)
708. [Elberfelder](https://sourceforge.net/projects/zefania-sharp/files/Bibles/GER/Elberfelder/)
709. [Schlachterbibel](https://sourceforge.net/projects/zefania-sharp/files/Bibles/GER/Schlachterbibel/)
710. [NeÜ](https://sourceforge.net/projects/zefania-sharp/files/Bibles/GER/Neue%20evangelistische%20Uebersetzung/)
711. [SPLC Extremist Files: Gab](https://www.splcenter.org/resources/extremist-files/gab/)
712. [startupfundraising: Edward Beccle](https://startupfundraising.com/founders/edward-beccle)
713. [Softonic: STEP iPhone](https://step-bible.en.softonic.com/iphone)
714. [STEPBible Guide: Who makes STEPBible](https://stepbibleguide.blogspot.com/p/who-makes-stepbible.html)
715. [Stereogum](https://stereogum.com/2300204/gwen-stefani-shares-another-prayer-app-ad-angers-fans-by-posting-tucker-carlson-video/news)
716. [stillbible.app: Dwell Review](https://stillbible.app/compare/dwell-review)
717. [stillbible.app](https://stillbible.app/de/compare/christliche-apps)
718. [stillbible: Pray.com Review 2026](https://stillbible.app/compare/pray-com-review)
719. [St. John's University 04.03.2026](https://www.stjohns.edu/news-media/news/2026-03-04/hallow-app-partners-st-johns-foster-community-prayer)
720. [Story & Stone: Best Social Media Platforms for Churches 2026](https://www.story-and-stone.com/blog/church-social-media-platforms-2026)
721. [StudyFinds](https://studyfinds.com/how-profit-driven-ai-jesus-chatbots-prey-on-prayer-driven-christians/)
722. [Subger](https://subger.com/en/service/bible-gateway-plus)
723. [Subsplash: Introducing Messaging](https://www.subsplash.com/blog/introducing-subsplash-messaging)
724. [Subsplash Messaging for Churches](https://www.subsplash.com/product/messaging-for-churches)
725. [Subsplash: Best Group Messaging App for Church Small Groups](https://www.subsplash.com/blog/subsplash-messaging-best-communication-tool-for-church-small-groups)
726. [Subsplash: 5 Insights digital discipleship](https://www.subsplash.com/blog/barna-subsplash-webinar-shaping-the-future-of-digital-discipleship)
727. [Logos Support: What's included](https://support.logos.com/hc/en-us/articles/21081346488205-What-s-included-in-Logos-subscriptions)
728. [Logos Support: How Logos uses AI](https://support.logos.com/hc/en-us/articles/35181728416397-How-Logos-uses-AI)
729. [Logos Support: Smart Search](https://support.logos.com/hc/en-us/articles/23526184005261-What-is-Smart-Search)
730. [Logos Support: AI Credits](https://support.logos.com/hc/en-us/articles/23563051328269-About-AI-Credits)
731. [Logos Support: Sermon Assistant](https://support.logos.com/hc/en-us/articles/23526222122125-What-can-I-do-with-Sermon-Assistant)
732. [Subsplash Support](https://support.subsplash.com/en/articles/9091124-launching-subsplash-messaging)
733. [t.me/pastorvladimirsavchuk](https://t.me/pastorvladimirsavchuk)
734. [Church Gist](https://t.me/s/ChurchGist/33009)
735. [Tandfonline: Lasting Changes in Worship](https://www.tandfonline.com/doi/full/10.1080/0458063X.2024.2428149)
736. [Yahoo/Tech](https://tech.yahoo.com/general/articles/softbank-celebrities-back-funding-faith-140309790.html)
737. [TechCrunch](https://techcrunch.com/2021/12/02/glorify-an-ambitious-app-for-christians-just-landed-40-million-in-series-a-funding-led-by-a16z/)
738. [TechCrunch 27.12.2021](https://techcrunch.com/2021/12/27/hallow-a-religious-app-for-catholics-talks-the-talk-as-religious-platforms-draw-investor-attention)
739. [TechFundingNews](https://techfundingnews.com/glorify-app-bags-40m/)
740. [textwith.me](https://textwith.me/en/jesus/faq/)
741. [The Church Digital: Discord Basics](https://thechurch.digital/blog/discord-basics/)
742. [The Citizen (Tansania)](https://www.thecitizen.co.tz/tanzania/news/national/youversion-bible-app-hits-one-billion-installs-launches-global-bible-month-5297860)
743. [The Conversation](https://theconversation.com/jesus-chatbots-are-on-the-rise-a-philosopher-puts-them-to-the-test-262524)
744. [TGC/Justin Taylor](https://www.thegospelcoalition.org/blogs/justin-taylor/scripture-tools-for-every-person-step-a-new-free-online-bible-study-resource/)
745. [theleadpastor.com](https://theleadpastor.com/tools/best-bible-apps/)
746. [theleadpastor: Best Bible Software](https://theleadpastor.com/tools/best-bible-software/)
747. [The Lead Pastor](https://theleadpastor.com/tools/best-church-management-software/)
748. [The Lead Pastor: Best Online Churches 2026](https://theleadpastor.com/church-management/best-online-churches/)
749. [theomix „Bibel zitieren ohne Stress“ (2012)](https://theomix.wordpress.com/2012/06/27/bibel-zitieren-ohne-stress/)
750. [theonet.de 2018](https://theonet.de/2018/10/18/whatsapp-in-der-gemeindearbeit-oder-wer-keine-daten-verarbeitet-kann-auch-keine-verstoesse-begehen/)
751. [The Witness](https://thewitness.org/is-there-a-christian-alternative-to-facebook/)
752. [thomas-ebinger.de](https://thomas-ebinger.de/2019/10/die-konapp-ekd-app-fuer-konfis-in-der-praxis/)
753. [Thriving Congregations](https://thrivingcongregations.org/fandl_feed_article/long-term-adoption-of-hybrid-services-represents-a-major-shift-from-the-traditional-church-model/)
754. [Tim Wildsmith Review](https://timwildsmith.com/reviews/dwell-app)
755. [TODAY](https://www.today.com/news/religious-chatbot-apps-rcna243671)
756. [Tracxn Hallow](https://tracxn.com/d/companies/hallow/__KTAm122vA7UhIoIBJEq8-DwcfbdA9OICMot6EdRuxfs)
757. [Tracxn Pray](https://tracxn.com/d/companies/pray/__PGvJjXfgWYru-8t06CDDy7vxJw8ENGGjYozfCZrOMW4)
758. [Tribune (PH) 08.10.2025](https://tribune.net.ph/2025/10/08/ai-generated-jesus-sermons-divide-faithfuls)
759. [Trustpilot: bible.com](https://www.trustpilot.com/review/bible.com?page=2)
760. [Trustpilot: glorify.com](https://www.trustpilot.com/review/glorify.com)
761. [Trustpilot: biblegateway.com](https://www.trustpilot.com/review/www.biblegateway.com)
762. [UMC Discipleship Ministries (Lifeway-Umfrage)](https://www.umcdiscipleship.org/articles/congregational-survey-from-lifeway-research)
763. [UnHerd](https://unherd.com/2025/05/you-wont-find-god-on-your-iphone/)
764. [Usermesh](https://usermesh.com/2026/07/07/church-whatsapp-group-problems/)
765. [Vatican News](https://www.vaticannews.va/de/kirche/news/2024-10/deutschland-religion-verliert-christliche-jugendliche-bedeutung.html)
766. [VatorNews Podcast mit Gatena 2022](https://vator.tv/2022-07-20-steve-gatena-ceo-at-praycom-on-vatornews-podcast/)
767. [Vestbee](https://www.vestbee.com/insights/articles/bible-chat-secures-14-m)
768. [viktorjanke.de](https://viktorjanke.de/alle-kostenlosen-hoerbibeln-zum-download-als-app-online/)
769. [Vision Christian Media](https://vision.org.au/read/news/ai-smart-rings-and-faith-advice-for-christians/)
770. [Warmpeach: YouVersion Alternatives](https://www.warmpeach.com/alternatives/youversion)
771. [Warmpeach: Bible Gateway Review](https://www.warmpeach.com/blog/reviews/bible-gateway)
772. [Washington Times 22.11.2023](https://www.washingtontimes.com/news/2023/nov/22/ai-generated-jesus-satan-offers-customers-opportun/)
773. [RightNow via Gloo](https://web.rightnowmedia.org/start/gloo)
774. [WORLD/wng.org](https://wng.org/sift/catholic-prayer-app-threatened-by-eu-data-regulations-1738343220)
775. [Word&Way 2018](https://wordandway.org/2018/07/27/with-330-million-downloads-top-bible-app-celebrates-10-years/)
776. [Word&Way 08.08.2023](https://wordandway.org/2023/08/08/new-ai-app-lets-users-text-with-jesus-and-other-biblical-figures/)
777. [Worship Facility](https://www.worshipfacility.com/2025/05/13/2025-state-of-church-tech-report-reveals-digital-tools-are-shaping-the-future-of-ministry/)
778. [Magisterium AI auf X, März 2025](https://x.com/magisteriumai/status/1904535033995554953)
779. [Yahoo: Salem-Vertrag](https://www.yahoo.com/news/bible-gateway-renews-exclusive-sales-180429978.html)
780. [YesPress: Hallow playbook](https://yespress.io/hallow)
781. [youversion.church](https://www.youversion.church/)
782. [FAQs](https://www.youversion.church/post/youversion-for-churches-faqs)
783. [YouVersion for Churches](https://www.youversion.church/post/how-to-effectively-use-youversion-to-engage-your-church)
784. [YouVersion News](https://www.youversion.com/news/bible-app-reaches-one-billion-installs)
785. [YouVersion Press](https://www.youversion.com/press/youversion-sees-rapid-adoption-of-its-bible-app-lite-in-the-first-year/)
786. [YouVersion: Bible App Lite](https://www.youversion.com/bible-app-lite)
787. [YouVersion: Introducing YouVersion Platform](https://www.youversion.com/news/introducing-youversion-platform)
788. [YouVersion Church Blog](https://youversion.com/church-blog/powering-connection-plans-with-friends)
789. [YouVersion Giving](https://www.youversion.com/giving)
790. [YouVersion History](https://www.youversion.com/history)
791. [YouVersion News, Dez. 2025](https://www.youversion.com/news/youversion-announces-2025-verse-of-the-year)
792. [YouVersion Press](https://www.youversion.com/press/youversion-community-creates-1-million-prayers-during-first-week-of-new-bible-app-prayer-feature/)
793. [YouVersion News 2024](https://www.youversion.com/news/youversions-verse-of-the-year-reflects-global-trend-of-seeking-peace-through-prayer)
794. [ZME Science](https://www.zmescience.com/future/millions-of-users-are-turning-to-ai-jesus-for-guidance-and-experts-warn-it-could-be-dangerous/)
795. [ZoomInfo Pray](https://www.zoominfo.com/c/pray-inc/397900629)
796. [Zukunft CH](https://www.zukunft-ch.ch/jugendstudie-zeigt-religion-verliert-an-bedeutung/)
