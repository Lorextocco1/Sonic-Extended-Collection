🦔 Sonic Extended Collection

Il Main del Progetto

La carriera videoludica di Sonic ha attraversato svariate console di ogni epoca, ma non tutti i titoli sono facilmente reperibili per PC Linux. È qui che entra in gioco il mio Launcher: non è un semplice Steam o Emulation Station alternativo, ma una vera e propria Bibbia della carriera del nostro porcospino preferito.

Qui troverete tutti i titoli principali della saga e alcuni spin-off di alto seguito come le serie Rush, Advance e gli Storybook per Nintendo Wii, dotati di comandi rifiniti per essere giocabili comodamente da controller. I comandi sono intuitivi: il movimento di slancio (in avanti e Homing Attack) di Secret Rings e il fendente di spada di Black Knight sono simulati tramite il tasto LT, rendendo il gameplay fluido e moderno.

Tutta la collezione è già configurata per ottenere le massime prestazioni e resa grafica. Sono stati inseriti shader specifici per i titoli Game Boy Advance e SEGA Mega Drive/Genesis per ricreare l'effetto visivo originale dell'epoca. Per il GBA, in particolare, è stato aggiunto un filtro di taratura colori che riporta il titolo al suo formato originale con colori leggermente saturati.

Il Launcher include anche due collegamenti extra per Sonic Colors Ultimate e Sonic Frontiers (maggiori dettagli nella sezione Tutorial). Ho allegato un pacchetto aggiuntivo con le copertine dei giochi e gli asset utilizzati per la cover del progetto, che troverete anche nel menu di pausa di RetroArch. La collezione contiene entrambe le versioni di Sonic Adventure per accontentare ogni palato. Spero che questo tool possa diventare la vostra Bibbia personale.
_________________________________________________________________________________________________________________________________________________________________________________________________________________________________
📖 Sezione Tutorial

Requisiti e Preparazione

Le configurazioni sono già incluse, eccezion fatta per gli artwork delle copertine (disponibili nel pacchetto linkato sotto). Per rispetto verso SEGA e per legalità, non sono inclusi l'eseguibile di RetroArch e le ROM, che dovranno essere copie di backup fornite dai vostri dischi o cartucce originali.

Passaggio 1: Estraete lo ZIP e posizionate la cartella Sonic Extended Collection dove preferite. Il pacchetto è autosufficiente e può essere utilizzato anche su periferiche esterne (USB/Hard Disk).

Passaggio 2: Scaricate le dipendenze:

. RetroArch AppImage: [Sito Ufficiale RetroArch](https://www.retroarch.com/?page=platforms) (Sezione Download -> Scaricate l'ultima versione base, non la QT).

. Estraete il pacchetto .7z, aprite la cartella estratta e troverete l'eseguibile AppImage e la cartella di configurazione standard.

. Importante: Copiate sia l'eseguibile che la cartella standard dentro la cartella retroarch della Sonic Extended Collection. Non modificate le altre cartelle presenti: esse gestiscono i miei script di configurazione e i comandi personalizzati.

Collegamenti per titoli Steam (Frontiers / Colors Ultimate)

Ho utilizzato degli script .sh che puntano direttamente all'AppID dei giochi installati regolarmente su Steam. Il gioco deve essere acquistato per funzionare.

1. Andate nella cartella roms, individuate il gioco (es. Sonic Colors Ultimate).

2. Tasto destro sul file .sh -> Rinomina -> copiate tutto il nome (inclusa l'estensione).

3. Aprite il terminale nella cartella e digitate: chmod +x "nome_file.sh" (incollando il nome copiato).

4. Ora lo script è riconosciuto dal sistema.

Aggiungere altri giochi Steam: Copiate un file .sh esistente in una nuova sottocartella in roms. Rinominate il file (usando il trattino basso _ al posto degli spazi). Aprite il file con un editor di testo e cambiate l'AppID.

. Per trovare l'AppID: Steam -> Libreria -> Tasto destro sul gioco -> Proprietà -> Aggiornamenti. Incollate il codice numerico nel file .sh al posto dei due codici esistenti.

. Per l'estetica: Nel Launcher, premete Start (o tasto destro) sul gioco -> Impostazioni -> Sfoglia "Script Launcher SH alternativo" -> selezionate il file .sh creato. Per le copertine, consiglio: [SteamGridDB](https://www.steamgriddb.com/).

Configurazione Emulatori (Core)

Aprite RetroArch dall'eseguibile base (non dal launcher) e scaricate i seguenti Core specifici:

. Nintendo 3DS: Citra (Ignorate la ver. 2018).

. Nintendo DS: DeSmuME.

. Game Boy Advance: mGBA (per fedeltà audio originale).

. Nintendo Wii: Dolphin.

. SEGA Dreamcast: Flycast.

. SEGA Mega Drive/Genesis: Genesis Plus GX.

Formati ROM supportati: I file devono essere rinominati esattamente come la cartella che li ospita.

GBA: .gba | Genesis: .md | GameCube: .iso | Dreamcast: .chd | Wii: .rvz | 3DS: .3ds | DS: .nds
_________________________________________________________________________________________________________________________________________________________________________________________________________________________________
🌟 Fan Game Relativi
La community di Sonic ha compiuto veri miracoli. Ecco i progetti che consiglio caldamente:

. Sonic Omens (by BOLT_): Un gioco completo con una qualità pari ai pilastri della saga. Trama a doppio filone tra Sonic/Tails e Shadow. [Link al Canale BOLT_](https://gamejolt.com/games/SonicOmens/469351)

. Sonic Adventure 2 Redux (by JeliLiam): Un remake in Unreal Engine 5 che riporta in auge gli stage iconici di SA2 con una veste grafica moderna. [Link al Progetto JeliLiam](https://gamejolt.com/games/SA2R/939490)

. Project Reignition (by Kuma-Boo): Una remastered di Sonic e gli Anelli Segreti che corregge i controlli legnosi del Wiimote adattandoli al joystick e migliora la grafica. [Link al GitHub Project Reignition](https://github.com/Kuma-Boo/project-reignition)

. Sonic Adventure Italian Mod (STB): Più di una traduzione; un restauro completo che riporta il gioco allo splendore dell'originale Dreamcast con bug fix e modelli migliorati. [Sito Ufficiale STB](https://www.youtube.com/@stb_ita) [Sonic Adventure Italian Mod](https://gamebanana.com/mods/339366).
_________________________________________________________________________________________________________________________________________________________________________________________________________________________________
🏆 Credits
. SEGA: Per averci permesso di sognare con le loro opere per tutti questi anni.

. Nibroc-Rock: L'artista dietro gli splendidi artwork della copertina. Il suo stile emula perfettamente quello ufficiale SEGA. [Profilo DeviantArt Nibroc-Rock](https://www.deviantart.com/nibroc-rock)

. Seven Soul: Un incredibile canale YouTube che realizza remix Rock/Heavy Metal delle OST di Sonic. [Canale YouTube Severed Soul](https://www.youtube.com/@SeveredSoul-44)

. Consiglio: Mettete i suoi MP3 nella cartella ost del Launcher per averli come musica di sottofondo!

. Unleashed Recompiled: Compilatore essenziale per giocare a Sonic Unleashed su PC (richiede backup Xbox 360). [GitHub Unleashed Recompiled](https://github.com/hedge-dev/UnleashedRecomp)

. Sonic Forces Overclocked: Una mod massiccia che riscrive interamente Sonic Forces con nuovi boss, stage e una storia ambientata dopo il finale ufficiale.
_________________________________________________________________________________________________________________________________________________________________________________________________________________________________
Grazie alla community che continua a rivoluzionare e preservare l'universo di Sonic. Buon divertimento!
