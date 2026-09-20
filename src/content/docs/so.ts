import type { DocsDictionary } from './types';

const so: DocsDictionary = {
  dir: 'ltr',
  ui: {
    docsLabel: 'Dukumeenti',
    home: 'Bogga hore',
    h1: 'Dukumeentiga FIVESOM',
    intro:
      'Hage cad oo tallaabo-tallaabo ah oo ku saabsan iibsashada adeegyada, iibinta xirfadaha, maamulka dalabaadyada, iyo sida lacagta loo helo FIVESOM. Dooro cutub bidixda ah si aad u akhrido mowduuca aad rabto oo keliya.',
    metaTitle: 'Dukumeentiga FIVESOM — Hage Iibsadayaasha iyo Freelancer-yada',
    metaDescription:
      'Dukumeentiga rasmiga ah ee FIVESOM: samaynta akoon, dhisidda profile-ka freelancer-ka, daabacaadda gig-yada, dalbashada adeegyada, lacagaha escrow-ka, ka bixinta lacagta, xaqiijinta, Blue Tick iyo taageerada.',
    searchPlaceholder: 'Raadi dukumeentiga…',
    clearSearch: 'Tirtir raadinta',
    browseHeading: 'U eeg cutub kasta',
    browseIntro: 'Ka bilow koox, ka dibna fur cutubka saxda ah ee aad u baahan tahay.',
    noResults: 'Wax cutub dukumeenti ah oo la mid ah raadintaada lama helin.',
    noResultsHint: 'Isku day eray fudud sida dalab, lacag-bixin, gig, taageero ama xaqiijin.',
    chaptersLabel: 'Cutubyada',
    relatedLabel: 'Cutubyo la xiriira',
    nextChapter: 'Cutubka xiga',
    previousChapter: 'Cutubka hore',
    backToDocs: 'Dhammaan cutubyada',
    languageLabel: 'Luqadda',
    videoCaption: 'Fiidiyowgan waxbarasho wuxuu ka tirsan yahay cutubkan.',
    openMenu: 'Fur cutubyada',
    closeMenu: 'Xir cutubyada',
    needHelpTitle: 'Weli caawimaad ma u baahan tahay?',
    needHelpBody: 'Haddii cutubku aan ka jawaabin su\'aashaada, kooxda taageerada FIVESOM waxay si toos ah u eegi kartaa akoonkaaga ama dalabkaaga.',
    needHelpCta: 'La xiriir Taageerada FIVESOM',
  },
  groups: {
    'getting-started': { title: 'Bilaabista', description: 'Waxa uu FIVESOM yahay, sida akoon loo furo, iyo sida loo ilaaliyo.' },
    freelancers: { title: 'Freelancer-yada', description: 'Dhis profile, daabac gig-yo, qiimee shaqadaada oo hel lacagtaada.' },
    buyers: { title: 'Iibsadayaasha', description: 'Hel freelancer-ka saxda ah, si ammaan ah u dalbo oo eeg dhammaadka shaqada.' },
    orders: { title: 'Dalabaadyada & Bixinta', description: 'Isgaarsiinta, bixinta, dib-u-eegista iyo khilaafaadka.' },
    payments: { title: 'Lacagaha & Amniga', description: 'Ilaalinta escrow-ka, sirta iyo dhaqanka aaminka ah ee suuqa.' },
    verification: { title: 'Xaqiijinta & VIP', description: 'Xaqiijinta aqoonsiga, Blue Tick-ga iyo xubinnimada VIP.' },
    support: { title: 'Taageerada', description: 'Sida loola xiriiro Taageerada FIVESOM iyo waxa lagu daro.' },
  },
  chapters: {
    'getting-started': {
      title: 'Ku Bilaabid FIVESOM',
      eyebrow: 'Dulmar guud oo barnaamijka ah',
      summary: 'Fahan waxa uu FIVESOM yahay, cidda uu u adeego, iyo sida shaqadu si ammaan ah ugu socoto laga bilaabo raadinta ilaa lacag-bixinta.',
      ctaLabel: 'Eeg sida FIVESOM u shaqeeyo',
      sections: [
        {
          heading: 'Waa maxay FIVESOM?',
          body: 'FIVESOM waa suuq freelancer ah oo loogu talagalay macaamiisha iyo freelancer-yada xirfadda leh, oo si gaar ah diirada saaraya kartida Afrikaanka iyo Soomaalida. Iibsadayaashu waxay raadiyaan adeegyo, freelancer-yaduna waxay daabacaan gig-yo, dalab kastaa oo la bixiyaana wuxuu ka socdaa barnaamijka laga bilaabo shuruudaha ilaa dhammaadka.',
        },
        {
          heading: 'Sida barnaamijku u shaqeeyo',
          bullets: [
            'Iibsade wuxuu helaa gig ama freelancer, ka dibna wuxuu doortaa xirmo adeeg.',
            'Iibsadaha wuxuu ku bixiyaa FIVESOM si dalabku ugu ilaaliso escrow.',
            'Freelancer-ku wuxuu helaa shuruudaha, wuu dhammeeyaa shaqada, wuxuuna soo gudbiyaa dhammaadka shaqada.',
            'Iibsadaha wuxuu aqbalaa dhammaadka shaqada, wuxuu codsan karaa dib-u-eegis, ama wuxuu furan karaa khilaaf haddii loo baahdo.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Samee akoon, ka dibna dooro inaad rabto inaad shaqaaleeyso freelancer-yo, inaad iibiso xirfadahaaga, ama labadaba ka samayso akoonka FIVESOM oo isku mid ah.',
        },
      ],
    },
    'creating-account': {
      title: 'Samaynta Akoonkaaga',
      eyebrow: 'Diyaarinta akoonka',
      summary: 'Samee akoon FIVESOM, dooro doorkaaga, oo diyaari profile-kaaga si aad u iibsato ama u iibiso adeegyo.',
      ctaLabel: 'Samee akoon',
      videoLabel: 'Casharka samaynta akoon FIVESOM',
      sections: [
        {
          heading: 'Waa maxay tan?',
          body: 'Akoonkaaga FIVESOM waa aqoonsiga aad ku isticmaasho markaad iibsanayso gig-yo, daabacaysid adeegyo, u dirayso fariimo isticmaalayaasha kale, maamulaysid dalabaadyo, oo aad heli lahayd ogeysiisyada barnaamijka.',
        },
        {
          heading: 'Tallaabooyinka samaynta akoon',
          bullets: [
            'Fur boggaajinta iyo ka sii wad ikhtiyaarka gelitaanka ee la heli karo.',
            'Dooro doorka aad marka hore u baahan tahay: iibsade, freelancer, ama kor u qaad markii dambe marka loo baahdo.',
            'Ku dar magacaaga, sawirkaaga profile-ka, goobta iyo qoraal gaaban oo kuu qeexa si isticmaalayaasha kale u ogaadaan cidda ay la shaqaynayaan.',
            'Dib u eeg dejinta akoonkaaga oo ilaali gelitaankaaga.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Iibsadayaashu waxay isla markiiba baaraan karaan adeegyada. Freelancer-yaduna waa inay dhammeeystaan profile-kooda ka hor inta aysan gig daabicin si iibsadayaashu u arkaan aragti xirfad leh.',
        },
      ],
    },
    'account-security': {
      title: 'Akoonka & Amniga',
      eyebrow: 'Sirta iyo ilaalinta',
      summary: 'Ilaali akoonkaaga oo fahan waxa macluumaad ah oo la wadaago dadweynaha, kan gaarka ah, ama kan loo isticmaalo amniga barnaamijka oo kaliya.',
      ctaLabel: 'Akhri siyaasadda sirta',
      sections: [
        {
          heading: 'Maxaa la ilaaliyaa?',
          body: 'FIVESOM wuxuu kala saaraa macluumaadka profile-ka dadweynaha ka soo horjeeda xogta akoonka gaarka ah, lacag-bixinta, dalabaadyada iyo xaqiijinta. Faylasha nabsiga leh sida dukumeentiyada aqoonsiga iyo lifaaqyada dalabka lama muujiyo weligood dadweynaha.',
        },
        {
          heading: 'Sida akoonkaaga loo ilaaliyo',
          bullets: [
            'Isticmaal website-ka rasmiga ah ee FIVESOM oo weligaa la wadaagin fadhigaaga gelitaanka.',
            'Isgaarsiinta dalabka iyo wadaagida faylalka ku hay gudaha barnaamijka.',
            'Dayac codsiyada in lacag-bixinta ama dhammaadka shaqada laga qaado FIVESOM dibadda.',
            'Isla markiiba soo warbixi profile been ah, portfolio been ah, ama codsiyo lacag oo shaki leh.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Haddii aad aragto dhaqan aan caadi ahayn, la xiriir Taageerada FIVESOM adigoo bixinaya email-ka akoonka, aqoonsiga dalabka ama xiriirka gig-ga si kooxdu si degdeg ah u baarto.',
        },
      ],
    },
    'freelancer-profile': {
      title: 'Profile-ka Freelancer-ka',
      eyebrow: 'Aasaaska iibiyaha',
      summary: 'Dhis profile si cad u sharraxaya xirfadahaaga, khibradaada, luqadaha, qalabka, portfolio-gaaga iyo calaamadaha aaminka ah.',
      ctaLabel: 'Wax ka bedel profile-kaaga freelancer-ka',
      sections: [
        {
          heading: 'Sababta profile-ku muhiim u yahay',
          body: 'Profile-kaagu waa meesha ugu horreysa ee iibsadayaashu ku xukumaan inaad tahay qof xirfad leh oo la isku halayn karo. Profile dhammaystiran ayaa ka caawiya iibsadayaasha inay fahmaan waxaad samayso ka hor inta aysan gig furin.',
        },
        {
          heading: 'Waxa la dhammeeyo',
          bullets: [
            'Isticmaal sawir profile oo cad iyo magac muuqda oo xirfad leh.',
            'Qor cinwaan gaar ah sida Naqshadeeye Astaan Ganacsi ama Horumariye Website React ah.',
            'Ku dar qoraal gaaban oo sharraxaya cidda aad caawiso iyo natiijooyinka aad keento.',
            'Liiso xirfadaha, luqadaha, qalabka iyo tusaalayaasha portfolio-ga ee muujinaya tayada shaqadaada.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka profile-kaagu dhammaado, samee gig leh xirmooyin cad, tusaalayaal, shuruudo iibsade iyo filashooyin dhammaadka shaqada.',
        },
      ],
    },
    'creating-gig': {
      title: 'Samaynta Gig',
      eyebrow: 'Daabacaadda adeegga',
      summary: 'U beddel adeeg bixin cad oo iibsadayaashu fahmi karaan, isbarbardhigi karaan, iibsan karaan oo qiimeyn karaan.',
      ctaLabel: 'Samee gig',
      videoLabel: 'Casharka samaynta gig FIVESOM',
      sections: [
        {
          heading: 'Waa maxay gig?',
          body: 'Gig waa adeeg freelancer oo la xirmeeyay. Wuxuu sharraxayaa waxa aad bixiso, qaybta uu ka tirsan yahay, waxa xirmo kastaa ku jiro, waxa iibsadaha uu bixin doono, iyo intee in le\'eg ay qaadanayso bixinta.',
        },
        {
          heading: 'Sida loo dhiso gig xoog leh',
          bullets: [
            'Dooro qaybta ugu sax badan oo qor cinwaan adeeg oo gaar ah.',
            'Sharrax natiijada iibsadaha helayo, ee kaliya hawsha aad qabaneyso ha ahaan.',
            'Ku dar xirmooyinka Aasaasiga, Caadiga iyo Premium-ka oo leh waxa la bixin doono oo cad.',
            'Ururi shuruudaha iibsadaha ka hor si aad u bilowdo shaqada la\'aanta dib-u-dhac.',
            'Isticmaal warbaahin portfolio ah oo muujinaya shaqadaada asalka ah.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka la daabaco, gig-kaagu wuxuu ka soo bixi karaa raadinta iyo boggaga qaybaha. Ku hay cinwaanka, sawirka, xirmooyinka iyo waqtiga bixinta oo sax ah si iibsadayaashu si sax ah u ogaadaan waxay dalbanayaan.',
        },
      ],
    },
    'packages-pricing': {
      title: 'Xirmooyinka Gig-ga & Qiimaha',
      eyebrow: 'Aasaasi, Caadi, Premium',
      summary: 'Isticmaal saddex heer xirmo ah si aad u fududayso isbarbardhigga adeeggaaga oo iibsadayaashu si fudud u iibsadaan.',
      sections: [
        {
          heading: 'Waa maxay xirmooyinka?',
          body: 'Xirmooyinku waa heerarka qiimaha ee gig-ga. Waxay caawiyaan iibsadayaasha inay doortaan heerka adeeg ee ay u baahan yihiin iyaga oo aan wax faahfaahin walba ka gorgortamin bilow.',
        },
        {
          heading: 'Sida xirmooyinka loo qaabeeyo',
          bullets: [
            'Aasaasigu waa inuu xalliyaa nooca ugu yar ee dhibaatada iibsadaha.',
            'Caadigu waa inuu ahaado qiimaha ugu wanaagsan ee ugu badan iibsadayaasha.',
            'Premium-ku waa inuu ka koobnaado bixinta ugu buuxda, waqti dhaqso ah, ama waxyaabo dheeraad ah.',
            'Heer walba waa inuu si cad u liistaa waqtiga bixinta, waxa ku jira, dib-u-eegisyada iyo xaddidaadaha.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka iibsade uu dalbado xirmo, qiimihiisa iyo waxa la bixin doono waxay noqdaan qayb ka mid ah diiwaanka dalabka. Ku hay faahfaahinta xirmooyinka mid dhab ah si khilaafaadku u fududaadaan in laga fogaado.',
        },
      ],
    },
    'earnings-fees': {
      title: 'Dakhliga & Kharashaadka Freelancer-ka',
      eyebrow: 'Baaqaanka boorsada',
      summary: 'Fahan sida dalabaadyada la dhammeeyay ay u noqdaan dakhli freelancer, iyo sida kharashka FIVESOM loo dabaqo.',
      ctaLabel: 'Fur boorsadaada',
      sections: [
        {
          heading: 'Goorma ayay freelancer-ku wax ku kasbadaan?',
          body: 'Freelancer-yadu waxay wax ku kasbadaan marka iibsadaha uu aqbalo dhammaadka shaqada. Ka hor aqbalidda, lacag-bixinta iibsadaha waxay ku sii jirtaa escrow oo lama heli karo si loo qaado.',
        },
        {
          heading: 'Sida kharashaadku u shaqeeyaan',
          bullets: [
            'FIVESOM waxay dabaqday kharash 15% ah oo barnaamij ah oo laga qaado dakhliga freelancer-ka marka lacagaha la qaado.',
            'Freelancer-ku wuxuu helayaa inta soo hadhay ee ah 85% ka dib kharashka barnaamijka.',
            'Baaqaanka boorsadu waxaa xisaabiya barnaamijka, weligeed lama wax ka beddelo browser-ka.',
            'Helitaanka lacag-qaadista waxay ku xirantahay dalabaadyada la dhammeeyay iyo codsiyada lacag-qaadis ee sugaya.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka lacagtu ku jirto boorsadaada, codso lacag-qaadis adoo isticmaalaya ikhtiyaarrada lacag-bixinta ee la taageero ee akoonkaaga.',
        },
      ],
    },
    withdrawals: {
      title: 'Lacag-qaadista',
      eyebrow: 'Bixinta lacagta',
      summary: 'Codso lacag-qaadis oo ka socda boorsadaada FIVESOM marka dakhli la heli karo uu jiro.',
      ctaLabel: 'Fur boorsadaada',
      videoLabel: 'Casharka ka qaadista dakhliga FIVESOM',
      sections: [
        {
          heading: 'Waa maxay lacag-qaadis?',
          body: 'Lacag-qaadis waa codsi la doonayo in dakhliga freelancer-ka ee la heli karo laga wareejiyo boorsadaada FIVESOM oo loo diro habka lacag-bixinta la taageero, oo ay ku jiraan lacagta mobilada maxaliga ah.',
        },
        {
          heading: 'Sida lacag-qaadistu u shaqeyso',
          bullets: [
            'Dhammee dalabaadyo oo sug ilaa aqbalka iibsadaha uu lacagta ku sii daayo boorsadaada.',
            'Xaqiiji faahfaahinta lacag-bixintaada ka hor inta aadan codsan lacag-qaadis.',
            'Ugu yaraan lacag-qaadista waa $20.',
            'FIVESOM waxay dib u eegtaa oo waxay hirgelisaa codsiyada lacag-qaadista ee u qalma sida xeerarka barnaamijku qabaan.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'La soco xaaladda lacag-qaadista boorsadaada. Haddii codsi loo baahdo dib-u-eegis, taageeradu waxay ku weydiin kartaa faahfaahin lacag-bixin oo la cusbooneysiiyay.',
        },
      ],
    },
    'finding-freelancers': {
      title: 'Helitaanka Freelancer-yada',
      eyebrow: 'Raadi oo isbarbardhig',
      summary: 'Hel freelancer-ka saxda ah adigoo isticmaalaya qaybta, faahfaahinta gig-ga, qiimeynta, tayada portfolio-ga, waqtiga bixinta iyo isgaarsiinta.',
      ctaLabel: 'Sahmi adeegyada',
      sections: [
        {
          heading: 'Maxay iibsadayaashu raadin karaan?',
          body: 'Iibsadayaashu waxay ku baari karaan FIVESOM qaybta adeegga, ereyada raadinta, profile-ka freelancer-ka, qiimeynta, qiimaha xirmada iyo habka bixinta.',
        },
        {
          heading: 'Sida si fiican loo doorto',
          bullets: [
            'Fur gig-ga oo akhri waxa xirmo kasta ku jiro ka hor inta aadan dalbanin.',
            'Hubi tusaalayaasha portfolio-ga, qiimeynta, heerka iyo calaamadaha xaqiijinta ee la\'yahay.',
            'La xiriir freelancer-ka marka hore haddii shaqadu adag tahay, gaar ah, ama degdeg ah.',
            'Xaqiiji qaabka bixinta, jadwalka iyo faylasha asalka ah ka hor inta aadan bixin.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Ka dib markaad doorato freelancer, dooro xirmada la habboon mashruucaaga oo sii wad checkout-ka ammaanka ah.',
        },
      ],
    },
    'buying-gig': {
      title: 'Iibsashada Gig',
      eyebrow: 'Samee dalab',
      summary: 'Dooro xirmo, si ammaan ah u bixi, gudbi shuruudaha, oo la soco dalabka boggaaga iibsadaha.',
      ctaLabel: 'Sahmi gig-yada',
      videoLabel: 'Casharka dalbashada adeeg FIVESOM',
      sections: [
        {
          heading: 'Waa maxay iibsashada gig?',
          body: 'Iibsashada gig waxay macnaheedu tahay in la doorto xirmo adeeg freelancer oo la sameeyo dalab FIVESOM. Dalabku wuxuu haystaa faahfaahinta xirmada, xaaladda lacag-bixinta, shuruudaha, faylasha bixinta, fariimaha iyo tallaabooyinka qiimeynta.',
        },
        {
          heading: 'Sida loo sameeyo dalab',
          bullets: [
            'Fur gig-ga oo isbarbardhig xirmooyinka Aasaasiga, Caadiga iyo Premium-ka.',
            'Weydii su\'aalo ka hor inta aadan dalbanin haddii mashruucaagu adag yahay.',
            'Ku bixi FIVESOM si dalabku ugu ilaaliso escrow.',
            'Gudbi shuruudaha freelancer-ku u baahan yahay si uu shaqada u bilaabo.',
            'La soco horumarka Dalabaadyadayda oo fariimaha ku hay barnaamijka gudihiisa.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Ka dib markii lacag-bixinta iyo shuruudaha dhammaystiran yihiin, freelancer-ku wuu bilaabaa shaqada oo wuxuu gudbiyaa dhammaadka shaqada bogga dalabka gudihiisa.',
        },
      ],
    },
    'order-requirements': {
      title: 'Shuruudaha Dalabka',
      eyebrow: 'Faahfaahinta mashruuca',
      summary: 'Sii freelancer-ka tilmaamaha, faylasha, tixraacyada iyo yoolalka loo baahan yahay si uu si sax ah u bilaabo.',
      ctaLabel: 'Eeg dalabaadyadaada',
      sections: [
        {
          heading: 'Waa maxay shuruudaha?',
          body: 'Shuruudaha dalabku waa tilmaamaha iyo faylasha uu iibsadaha soo gudbiyo ka dib checkout-ka. Waxay freelancer-ka u sheegaan waxa uu abuuri doono, qaabka uu bixin doono, iyo faahfaahinta ugu muhiimsan.',
        },
        {
          heading: 'Waxa la daro',
          bullets: [
            'Yool gaaban oo mashruuc ah iyo waxa saxda ah ee aad filayso in la keeno.',
            'Magacyada brand-ka, midabada, qoraalka, faylasha, xiriiriyeyaasha, cabbirrada ama fiiro gaar ah oo farsamo.',
            'Tusaalayaal waxaad jeceshahay iyo waxa freelancer-ku ka fogaan lahaa.',
            'Kama dambeys cad haddii mashruucu ku xirnaa taariikh bilow ama ololayaal.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka shuruudaha la gudbiyo, dalabku wuxuu u gudbaa shaqo firfircoon. Shuruudo maqan ayaa dib u dhigi kara freelancer-ka oo dib u riixi kara bixinta.',
        },
      ],
    },
    'reviewing-delivery': {
      title: 'Dib U Eegista Bixinta',
      eyebrow: 'Aqbal, qiimee ama weydii isbeddel',
      summary: 'Si taxaddar leh u hubi shaqada la bixiyay ka hor intaadan aqbalin, sababtoo ah aqbalku wuxuu sii daayaa lacag-bixinta escrow-ka.',
      ctaLabel: 'Eeg dalabaadyadaada',
      videoLabel: 'Casharka aqbalka iibsadaha iyo sii daynta lacagta',
      sections: [
        {
          heading: 'Waa maxay dib u eegista bixinta?',
          body: 'Dib u eegista bixintu waa qodobka go\'aanka iibsadaha. Waxaad barbardhigtaa shaqada la bixiyay iyo xirmada iyo shuruudaha, ka dibna waxaad aqbashaa, weydiisataa dib-u-eegis, ama furtaa khilaaf.',
        },
        {
          heading: 'Sida loo dib u eego si ammaan ah',
          bullets: [
            'Fur dhammaan faylasha iyo xiriiriyeyaasha ka hor inta aadan riixin Aqbal Bixinta.',
            'Barbardhig shaqada iyo shuruudaha aad gudbisay.',
            'Isticmaal codsiyada dib-u-eegis waxyaabo cad oo la hagaajin karo.',
            'Kaliya fur khilaaf marka bixintu aan la mid ahayn dalabka oo dib-u-eegis ay xallin waydo.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka aad aqbasho bixinta, escrow-ku wuxuu u sii daayaa freelancer-ka, waxaadna ka bixin kartaa qiimeyn 1–5 xiddigood oo leh faallo qoraal ah.',
        },
      ],
    },
    'messaging-communication': {
      title: 'Fariimaha & Isgaarsiinta',
      eyebrow: 'Si cad wada shaqee',
      summary: 'Isticmaal fariimaha FIVESOM si aad u xaqiijiso baaxadda, u wadaagto faylasha, ka jawaabto su\'aalaha oo aad ilaaliso diiwaan mashruuc oo la ilaaliyay.',
      ctaLabel: 'Fur boorsadaada fariimaha',
      videoLabel: 'Casharka fariimaha FIVESOM',
      sections: [
        {
          heading: 'Sababta fariimuhu muhiim u yihiin',
          body: 'Isgaarsiin qoraal ah oo cad ayaa ka hortagta inta badan dhibaatooyinka dalabka. Fariimuhuna waxay abuuraan diiwaan taageeradu dib u eegi karto haddii khilaaf la furo.',
        },
        {
          heading: 'Hab-dhaqannada ugu fiican',
          bullets: [
            'Xaqiiji baaxadda, jadwalka, qaabka faylalka iyo filashooyinka ka hor inta shaqadu bilaabmin.',
            'Go\'aannada muhiimka ah ee mashruuca oo dhan ku hay chat-ka FIVESOM gudihiisa.',
            'Isticmaal lifaaqyada iyo xiriiriyeyaasha kaliya marka ay taageeraan dalabka.',
            'Si degdeg ah oo xirfad leh u jawaab, gaar ahaan marka dib-u-eegis la codsado.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Marka freelancer-ku helo macluumaadka loo baahan yahay, wuu dhammeeyaa shaqada oo wuxuu gudbiyaa dhammaadka shaqada bogga dalabka gudihiisa.',
        },
      ],
    },
    'delivering-order': {
      title: 'Bixinta Dalabka',
      eyebrow: 'Habka shaqada freelancer-ka',
      summary: 'Gudbi shaqada la dhammeeyay bogga dalabka gudihiisa si iibsadaha uu u dib u eego oo escrow-ka loo sii daayo ka dib aqbalka.',
      ctaLabel: 'Fur dalabaadyadaada',
      videoLabel: 'Casharka maamulka iyo bixinta dalabaadyada FIVESOM',
      sections: [
        {
          heading: 'Maxaa loo tiriyaa bixin?',
          body: 'Bixintu waa shaqada la dhammeeyay, fariinta, faylasha, xiriiriyeyaasha ama tilmaamaha uu freelancer-ku u gudbiyo dib u eegis iibsade. Waa inay la mid tahay xirmada la iibsaday iyo shuruudaha iibsadaha.',
        },
        {
          heading: 'Sida loo bixiyo si xirfad leh',
          bullets: [
            'Dib u eeg shuruudaha asalka ah ka hor inta aadan gudbin faylasha ugu dambeeya.',
            'Soo shub faylasha saxda ah oo ku sharrax fariinta bixinta waxa ku jira.',
            'Ku xus fiiro gaar ah oo isticmaal, qaab faylal ama tallaabooyin xiga uu iibsadaha u baahan yahay.',
            'Weligaa ha u calaamadin shaqo aan dhammaystirnayn mid la bixiyay si aad ugu joojiso kama dambeys.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Iibsadaha wuu dib u eegaa bixinta wuxuuna aqbali karaa, codsan karaa dib-u-eegis, ama furi karaa khilaaf haddii shaqadu aan la mid ahayn dalabka.',
        },
      ],
    },
    revisions: {
      title: 'Dib-u-eegisyada',
      eyebrow: 'Codso isbeddello',
      summary: 'Isticmaal dib-u-eegisyada si aad u codsato isbeddello gaar ah ka hor inta aadan aqbalin bixinta.',
      sections: [
        {
          heading: 'Waa maxay dib-u-eegis?',
          body: 'Dib-u-eegis waa codsi loogu talagalay in freelancer-ku hagaajiyo bixin u dhow oo aan weli sax ahayn. Waa inay ku sii jirtaa baaxadda iyo shuruudaha dalabka asalka ah.',
        },
        {
          heading: 'Sida loo codsado dib-u-eegis faa\'iido leh',
          bullets: [
            'Si gaar ah u sheeg waxa la beddeli lahaa iyo halka dhibaatadu ka muuqato.',
            'Ku lifaaq sawirro shaashad, waqtiyo, magacyo faylal ama tusaalayaal marka ay caawin karto.',
            'Codsiga ku hay xirmada aad iibsatay.',
            'Ka fogow inaad codsato mashruuc gebi ahaanba cusub oo loo sheegayo dib-u-eegis.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Freelancer-ku wuxuu dib u eegaa codsigaaga, wuxuu cusbooneysiiyaa shaqada oo wuxuu gudbiyaa bixin cusub si aad mar labaad u dib u eegto.',
        },
      ],
    },
    disputes: {
      title: 'Khilaafaadka',
      eyebrow: 'Marka dalab u baahan yahay dib-u-eegis',
      summary: 'Fur khilaaf marka iibsadaha iyo freelancer-ku aysan xallin karin arrin dalab ah iyagoo isticmaalaya fariimo ama dib-u-eegis.',
      videoLabel: 'Casharka habka khilaafka FIVESOM',
      sections: [
        {
          heading: 'Waa maxay khilaaf?',
          body: 'Khilaafku wuxuu weydiiyaa taageerada FIVESOM inay dib u eegto dalabka oo ay go\'aamiso natiijada ugu caddaalad badan iyadoo ku saleysan faahfaahinta dalabka, fariimaha, faylasha iyo caddaynta labada dhinac.',
        },
        {
          heading: 'Sida khilaafaadku u shaqeeyaan',
          bullets: [
            'Mid ka mid ah dhinacyada ayaa sharraxa dhibaatada bogga dalabka gudihiisa.',
            'Labada dhinac waxay bixin karaan fariimo, faylal, sawirro shaashad ama caddayn kale oo dalabka la xiriirta.',
            'Kooxda taageeradu waxay dib u eegtaa baaxadda asalka ah iyo taariikhda bixinta.',
            'Natiijadu waxay ku jiri kartaa hagitaan dib-u-eegis, maamulka lacag-celin, ama sii daynta lacagta iyadoo ku xiran caddaynta.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Lacagtu waxay sii ilaaliyaa inta khilaafku la eegayo. Isgaarsiinta ku hay xirfad leh oo si degdeg ah uga jawaab marka taageeradu faahfaahin weydiiso.',
        },
      ],
    },
    'escrow-payments': {
      title: 'Escrow & Lacag-bixinnada',
      eyebrow: 'Ilaalinta lacag-bixinta',
      summary: 'Baro sida FIVESOM ay si ammaan ah u haysato lacagaha iibsadaha ilaa shaqadu la bixiyo oo la aqbalo.',
      sections: [
        {
          heading: 'Waa maxay escrow?',
          body: 'Escrow waxay macnaheedu tahay in iibsadaha uu ku bixiyo FIVESOM, laakiin freelancer-ku isla markiiba lacagta ma helo. Lacag-bixintu way sii jirtaa inta shaqadu la dhammaynayo.',
        },
        {
          heading: 'Sida ilaalinta lacag-bixintu u shaqeyso',
          bullets: [
            'Iibsadaha wuxuu ku bixiyaa hab checkout oo la ansixiyay oo FIVESOM ah.',
            'Dalabku wuxuu noqdaa mid firfircoon ka dib marka lacag-bixinta la xaqiijiyo.',
            'Freelancer-ku wuxuu bixiyaa shaqada bogga dalabka gudihiisa.',
            'Iibsadaha wuxuu aqbalaa bixinta oo lacag-bixintu waxay u sii daayaan boorsada freelancer-ka.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Haddii bixintu aan la mid ahayn dalabka, iibsadaha wuxuu codsan karaa dib-u-eegis ama furi karaa khilaaf ka hor inta aanu aqbalin.',
        },
      ],
    },
    'privacy-trust': {
      title: 'Sirta & Aaminka',
      eyebrow: 'Dhaqanka suuqa ee ammaanka ah',
      summary: 'Fahan sida FIVESOM u ilaaliso xogta gaarka ah iyo waxa isticmaalayaashu tahay inay sameeyaan si dalabaadyada loo ilaaliyo.',
      ctaLabel: 'Akhri xeerarka',
      sections: [
        {
          heading: 'Maxaa sii ah gaarka?',
          body: 'Faahfaahinta akoonka gaarka ah, dukumeentiyada aqoonsiga, diiwaanka lacag-bixinta, lifaaqyada dalabka, iyo go\'aannada xaqiijinta gudaha ah weligood kama mid aha profile-yada dadweynaha ama boggaga gig-ga.',
        },
        {
          heading: 'Sida isticmaalayaashu u sii wataan aaminka',
          bullets: [
            'Isticmaal shaqo portfolio dhab ah iyo macluumaad profile daacadnimo leh.',
            'Weligaa ha weydiisan lacag-bixin barnaamijka dibadiisa ah ama faahfaahin xiriir gaarka ah si looga gudbo FIVESOM.',
            'Soo warbixi akoonno been ah, shaqo la xaday, fariimo caayad ah, ama dhaqan lacag oo shaki leh.',
            'Isticmaal khilaafaadka kaliya dhibaatooyin dalab oo dhab ah oo bixi caddayn cad.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Warbixinnada iyo khilaafaadka waxaa dib u eegta kooxda FIVESOM. Akoonnada jabiya xeerarka suuqa waxay heli karaan digniin, xayiraad, ama saarid.',
        },
      ],
    },
    verification: {
      title: 'Xaqiijinta Akoonka',
      eyebrow: 'Calaamadda iibiyaha la xaqiijiyay',
      summary: 'Xaqiiji aqoonsigaaga si iibsadayaashu u arkaan in qof dhab ah oo la hubiyay uu ka danbeeyo gig-yadaada.',
      ctaLabel: 'Bilow xaqiijinta',
      videoLabel: 'Casharka xaqiijinta akoonka FIVESOM',
      sections: [
        {
          heading: 'Waa maxay xaqiijinta?',
          body: 'Xaqiijintu waa hubinta aqoonsiga. Waxaad ka soo gudbisaa dukumeenti aqoonsi rasmi ah boggaaga freelancer-ka, kooxda FIVESOM ayaa dib u eegta, akoonka la ansixiyayna wuxuu helaa calaamadda cagaaran ee La Xaqiijiyay ee profile-kiisa iyo gig-yadiisa.',
        },
        {
          heading: 'Sida loo xaqiijiyo',
          bullets: [
            'Fur Xaqiijinta boggaaga freelancer-ka oo marka hore dhammee faahfaahinta profile-kaaga.',
            'Soo shub sawir cad oo dukumeenti aqoonsi la aqbalay, sida baasaboor, aqoonsi qaran ama shatiga darawalnimo.',
            'Hubi in magaca ku qoran dukumeentigu la mid yahay magaca ku yaal profile-kaaga FIVESOM.',
            'Gudbi codsiga oo sug dib-u-eegista — dukumeentiyada waxaa si sir ah loo kaydiyaa oo waxaa kaliya arka shaqaale la ogolaaday.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Haddii dib-u-eegistu guulaysato, calaamadda La Xaqiijiyay ayaa ka soo muuqata profile-kaaga dadweynaha. Haddii wax aan cadeyn ahi jiraan, kooxdu waxay weydiisan doontaa dukumeenti cusub oo aad mar labaad soo gudbin karto. Xaqiijintu ma aha isla wax Blue Tick-ka.',
        },
      ],
    },
    'blue-tick': {
      title: 'Blue Tick',
      eyebrow: 'Waxaa keliya bixiya FIVESOM',
      summary: 'Blue Tick-ku waa calaamadda ugu sarreysa ee aaminka FIVESOM waxaana keliya siiyaa kooxda FIVESOM ka dib dib-u-eegis.',
      ctaLabel: 'Fur codsiga Blue Tick',
      sections: [
        {
          heading: 'Waa maxay Blue Tick-ka?',
          body: 'Blue Tick-ku wuxuu calaamadeeyaa freelancer-yada khibradda leh ee lagu kalsoonaan karo. Lama iibsan karo, mana aha mid iskiis u socda: kooxda FIVESOM ayaa si gacan ah dib u eegta codsi kasta oo siisa calaamadda. Waa mid ka duwan calaamadda cagaaran ee La Xaqiijiyay.',
        },
        {
          heading: 'U qalmitaanka iyo codsiga',
          bullets: [
            'Akoonkaagu waa inuu ugu yaraan 100 maalmood jiraa, laga xisaabinayo taariikhda dhabta ah ee isdiiwaangelinta.',
            'U qalmitaanku waxaa lagu xisaabiyaa dhaqan dhab ah: dalabaadyo la dhammeeyay, qiimeynno, dakhli iyo tayada profile-ka.',
            'Codsigu wuxuu ka koobnaa saddex tallaabo — macluumaad xirfadeed, macluumaad aqoonsi, iyo hubinta wejiga ama kamerada.',
            'Horumarku waa la keydiyaa intaad socoto, oo saddexda tallaabo oo dhan waa inay dhammaystiran yihiin ka hor inta codsigu la gudbin karo.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Kooxda FIVESOM waxay ansixin kartaa, diidi kartaa, ama weydiisan kartaa isbeddello. Freelancer-yada la ansixiyay waxay muujiyaan Blue Tick-ka barnaamijka oo dhan. Dukumeentiyada iyo sawirrada wejigu waxay sii ahaadaan kuwo gaar ah oo kaliya loo isticmaalo dib-u-eegistan.',
        },
      ],
    },
    'vip-membership': {
      title: 'Xubinnimada VIP',
      eyebrow: 'Astaamaha koritaanka',
      summary: 'Fahan astaamaha muuqaalka VIP-ka, xaddidaadaha iibiyaha, iyo sida xubinnimadu u taageerto freelancer-yada aad u dadaala.',
      ctaLabel: 'Eeg xubinnimada VIP',
      sections: [
        {
          heading: 'Waa maxay VIP?',
          body: 'Xubinnimada VIP waxaa loogu talagalay freelancer-yada rabta muuqaal iyo qalab koritaan oo dheeraad ah. Waxay dhamaystirtaa tayada shaqada oo xoog leh; ma bedelayso qiimeynta, waxqabadka bixinta ama xeerarka suuqa.',
        },
        {
          heading: 'Sida VIP-ka si masuuliyad leh loo isticmaalo',
          bullets: [
            'Ku hay tayada gig-ga mid sarreysa ka hor inta aadan bixin muuqaal dheeraad ah.',
            'Isticmaal awoodda gig-ga dheeraadka ah kaliya adeegyada aad si fiican u bixin karto.',
            'Ku sii wad jawaabo dhaqso ah, bixin waqtiga ku habboon iyo isgaarsiin cad oo iibsadayaal ah.',
            'Dib u eeg waxqabadkaaga ka hor inta aadan kor u qaadin ama cusboonaysiin.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Booqo bogga VIP-ka si aad u isbarbardhigto ikhtiyaarrada la heli karo oo aad hubiso in qorshuhu la habboon yahay culeyska freelancer-nimada aad hadda haysato.',
        },
      ],
    },
    support: {
      title: 'Taageerada FIVESOM',
      eyebrow: 'Caawimaad iyo xiriir',
      summary: 'Hel jawaabo, la xiriir taageerada, oo ku dar macluumaadka saxda ah si kooxdu si degdeg ah kuu caawiso.',
      ctaLabel: 'La xiriir taageerada',
      sections: [
        {
          heading: 'Goorma ayaad la xiriiri lahayd taageerada?',
          body: 'La xiriir Taageerada FIVESOM haddii aad qabto dhibaato gelitaan akoon, su\'aalo lacag-bixin, khilaaf dalab, dhibaato xaqiijin, dhaqan shaki leh, ama wax kasta oo dukumeentigani aan ka jawaabin.',
        },
        {
          heading: 'Waxa la daro',
          bullets: [
            'Aqoonsiga dalabkaaga, xiriirka gig-ga, ama xiriirka profile-ka marka su\'aashu la xiriirto bog gaar ah.',
            'Sharraxaad gaaban oo ah waxa dhacay iyo waxa aad filaysay in ay ahaan lahayd.',
            'Sawirro shaashad ama faylal kaliya marka ay taageerada ka caawiyaan fahamka arrinta.',
            'Luqadda jawaabta aad doorbidayso haddii aad u baahan tahay taageero Soomaali, Carabi, Faransiis ama Ingiriisi ah.',
          ],
        },
        {
          heading: 'Waa maxay ku xiga?',
          body: 'Taageeradu waxay dib u eegtaa codsiga, waxay hubisaa diiwaannada akoonka ama dalabka la xiriira, waxayna ku soo jawaabtaa tallaabada xigta ama go\'aanka.',
        },
      ],
    },
  },
};

export default so;
