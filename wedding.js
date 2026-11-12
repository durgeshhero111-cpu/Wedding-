// Edit these, commit, push.
module.exports = {
  date: "2026-11-25T19:00:00+05:30", // countdown target (baraat, 7 PM IST)
  map: "https://maps.app.goo.gl/wjFYbDrDrQS77jV96",
  theme: "royal", // default template id
  // each template = colours (theme) + a different page layout
  templates: [
    { id: "royal", name: "Royal Classic – framed card", layout: "classic" },
    { id: "emerald", name: "Emerald Story – full-screen slides", layout: "story" },
    { id: "midnight", name: "Midnight Arch – arched cards", layout: "arch" },
    { id: "saffron", name: "Saffron Timeline – left-aligned journey", layout: "timeline" },
    { id: "ivory", name: "Ivory Minimal – clean editorial", layout: "minimal" },
    { id: "petal", name: "Gulabi Petals – गिरती गुलाब पंखुड़ियाँ", layout: "petal", bl: "🌹 प्रेम की पहली पंखुड़ी 🌹", sh: "दो हृदय, दो परिवार, एक पवित्र बंधन —<br>गुलाब की महक-सा महके यह नया संसार।", wish: "आपके स्नेह की पंखुड़ियाँ बरसेंगी तो हमारा आँगन महक उठेगा।" },
    { id: "diya", name: "Deepotsav – झिलमिल दीपक", layout: "diya", bl: "🪔 शुभ दीप प्रज्वलित 🪔", sh: "तमसो मा ज्योतिर्गमय —<br>दो जीवन एक ज्योति बनकर जगमगाएँ।", wish: "आपके आगमन से हमारे उत्सव का दीप और भी प्रज्वलित होगा।" },
    { id: "mor", name: "Mor Pankh – मोरपंख नेत्र", layout: "mor", bl: "॥ मोरपंख-सा सुंदर संयोग ॥", sh: "रंग-बिरंगे सपनों के पंख लगाकर<br>दो आत्माएँ बँध रही हैं एक सुंदर बंधन में।", wish: "आपकी उपस्थिति हमारे उत्सव का सबसे सुंदर रंग होगी।" },
    { id: "star", name: "Taron Bhari Raat – टिमटिमाते तारे", layout: "star", bl: "✦ सितारों की साक्षी में ✦", sh: "चाँद-तारों ने लिखा है यह मिलन,<br>सात जन्मों का साथ आज से आरम्भ।", wish: "आपकी शुभकामनाएँ हमारे आकाश का सबसे चमकता तारा बनेंगी।" },
    { id: "mehndi", name: "Mehndi Jaal – बनती मेहंदी बेल", layout: "mehndi", bl: "❀ मेहंदी रचे हाथों से ❀", sh: "हथेलियों पर रचा है प्रेम का रंग,<br>जितनी गहरी मेहंदी, उतना गहरा साथ।", wish: "आइए, हमारी खुशियों में अपने स्नेह का रंग भरने।" },
    { id: "sunrise", name: "Suprabhat – उगता सूरज", layout: "sunrise", bl: "☀ शुभ प्रभात, नई शुरुआत ☀", sh: "उगते सूरज की पहली किरण के साथ<br>एक नए जीवन का मंगल आरम्भ।", wish: "आपका आशीर्वाद हमारे नए सवेरे की पहली किरण होगा।" },
    { id: "toran", name: "Bandanwar – झूमते गेंदे के तोरण", layout: "toran", bl: "🌼 बंदनवार सजे हैं द्वार 🌼", sh: "गेंदे के तोरण, आम के पल्लव,<br>द्वार पर सजी है आपके स्वागत की थाली।", wish: "पधारिए, हमारे आँगन को अपने चरणों से पावन कीजिए।" },
    { id: "mahal", name: "Rajwada Jharokha – खुलते झरोखे", layout: "mahal", bl: "॥ राजसी विवाह उत्सव ॥", sh: "झरोखों से झाँकती खुशियाँ,<br>महलों-सा सजा है यह मंगल मिलन।", wish: "आपकी गरिमामयी उपस्थिति हमारे उत्सव की शोभा बढ़ाएगी।" },
    { id: "rangoli", name: "Rangoli Utsav – घूमती रंगोली", layout: "rangoli", bl: "✿ रंगों का उत्सव ✿", sh: "देहरी पर सजी रंगोली की तरह<br>रंगीन हो यह जीवन-बंधन।", wish: "आइए, हमारे उत्सव में अपने स्नेह के रंग भरिए।" },
    { id: "neon", name: "Aatishbazi – आतिशबाज़ी", layout: "neon", bl: "✨ खुशियों की आतिशबाज़ी ✨", sh: "जब दो दिल मिलते हैं तो<br>आसमान भी जश्न मनाता है।", wish: "आपके बिना हमारी यह शाम अधूरी है — अवश्य पधारें।" },
  ],
  themes: ["royal", "emerald", "midnight", "saffron", "ivory", "petal", "diya", "mor", "star", "mehndi", "sunrise", "toran", "mahal", "rangoli", "neon"],
  def: { bl: "॥ श्री गणेशाय नमः ॥", sh: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।<br>निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥", wish: "आपकी उपस्थिति हमारे लिए सौभाग्य है।" },
  msg: "नमस्ते {name} जी 🙏\n\nपरमपिता परमेश्वर की असीम अनुकम्पा से स्नेहा एवं रवि के पावन परिणयोत्सव (25 नवम्बर 2026) में हम आपको सपरिवार सादर आमंत्रित करते हैं।\n\nआपका व्यक्तिगत निमंत्रण यहाँ खोलें:\n{link}\n\n– मिश्रा परिवार, बनबैरिया",
};
