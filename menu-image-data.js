const imageData = (() => {
    const pexelsPhoto = (photoId) => `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=720`;
    const flavorPhotos = {
      "lemon-mint": "pexels-beyza-sukran-demi-rbas-730252876-33107433.jpg",
      "strawberry": "pexels-shameel-mukkath-3421394-17612783.jpg",
      "pineapple": "pexels-shameel-mukkath-3421394-5817623.jpg",
      "orange": "pexels-wendelmoretti-15502645.jpg",
      "lemon": "pexels-beyza-sukran-demi-rbas-730252876-33107433.jpg",
      "avocado": "pexels-mrpugo-33116728.jpg",
      "mango": "pexels-shameel-mukkath-3421394-5817621.jpg",
      "passion": pexelsPhoto(17612801),
      "chocolate": pexelsPhoto(39947611),
      "vanilla": pexelsPhoto(28525197),
      "pistachio": pexelsPhoto(6463660),
      "oreo": pexelsPhoto(39947611),
      "banana": pexelsPhoto(8215113),
      "chikoo": pexelsPhoto(8215113),
      "guava": pexelsPhoto(8215113),
      "sweet-melon": pexelsPhoto(8215113),
      "apple": pexelsPhoto(8215113),
      "grape": pexelsPhoto(8215113),
      "pomegranate": pexelsPhoto(8215113),
      "kiwi": pexelsPhoto(8215113),
      "papaya": pexelsPhoto(8215113),
      "watermelon": pexelsPhoto(8215113)
    };
    const restaurantItemPhotos = {
      "karak-tea": "IMG_3148.PNG",
      "karak-flask-special": "60b6c548534eaa0f497274b8126f47af.jpg",
      "karkadi-hibiscus-tea": "IMG_3477.JPG",
      "hibiscus-passion": pexelsPhoto(17612801),
      "hibiscus-mango": "D7332C6D-6831-4E02-83B8-A56768554172.png",
      "hibiscus-orange": "pexels-stephen-leonardi-587681991-30900665.jpg",
      "hibiscus-pineapple": "IMG_3940.PNG",
      "hibiscus-lemon": "IMG_3916.JPG",
      "hibiscus-blue-lagoon": "IMG_3916.JPG",
      "hibiscus-strawberry": "IMG_3948.JPG",
      "saffron-karak": "ECBB438D-1824-4028-B1C7-5738610CD26A.png",
      "arabic-coffee": "60b6c548534eaa0f497274b8126f47af.jpg",
      "ice-cream-strawberry": "58ABF5B7-6983-4B9C-8B0A-3C01B8CEBA42.png",
      cappuccino: "IMG_3628.JPG",
      "hot-chocolate": "IMG_3636.JPG",
      "shake-chocolate": "IMG_3515.WEBP",
      "shake-oreo": "IMG_3939.JPG",
      "ghori-avocado": "F4D1A9F8-6839-4C19-A97A-43BEA4808C49.png",
      "ghori-mango": "D7332C6D-6831-4E02-83B8-A56768554172.png",
      "fresh-juice-family-combo": "IMG_3940.PNG",
      "pure-orange": "pexels-stephen-leonardi-587681991-30900665.jpg",
      "mojito-blue": "IMG_3916.JPG",
      "mojito-classic": "IMG_3949.JPG",
      "mojito-strawberry": "IMG_3949.JPG",
      "mojito-mango": "218C4458-9FCF-4E4E-A966-4961F4E9F82F.png",
      "boil-egg": "IMG_3953.JPG",
      "egg-sandwich": "b107e278-9e38-406d-9bef-2f1d56d8f880.jpg",
      "chicken-nuggets-sandwich": "IMG_4044.JPG",
      "sausage-sandwich": "IMG_4045.JPG",
      "egg-tomato-sandwich": "240_F_537909820_eSCbPrCS0uHjBCPRJj6XYQSmgXOVodH8.jpg",
      "chicken-burger": "IMG_3942.JPG",
      "beef-burger": "IMG_3956.JPG",
      "chicken-fillet-sandwich": "IMG_4044.JPG",
      "chicken-mince-sandwich": "IMG_3954.JPG",
      "beef-fillet-zinger": "IMG_3955.JPG",
      "sausage-zinger": "IMG_3955.JPG",
      "chicken-burger-box": "IMG_4048.JPG",
      "beef-burger-box": "IMG_4041.JPG",
      "club-egg": "IMG_4043.JPG",
      "club-chicken": "IMG_3920.JPG",
      "club-beef": "IMG_4043.JPG",
      "malgoum-egg": "IMG_3953.JPG",
      "malgoum-chips-oman": "IMG_4042.JPG",
      "malgoum-sunshine": "IMG_3959.JPG",
      "malgoum-zinger": "IMG_3954.JPG",
      "malgoum-nuggets": "IMG_3954.JPG",
      "malgoum-fillet": "IMG_4042.JPG",
      "malgoum-samosa": "IMG_3915.JPG",
      "malgoum-nutella": "IMG_3957.JPG",
      "malgoum-nutella-cheese": "IMG_3957.JPG",
      "roomi-samosa": "IMG_3915.JPG",
      "roomi-nutella": "IMG_3957.JPG",
      "zinger-chicken": "IMG_4040.JPG",
      "zinger-box": "IMG_4040.JPG",
      "club-sandwich-plate": "IMG_4043.JPG",
      "chicken-mayonnaise": "IMG_3954.JPG",
      "fillet-chicken-plate": "IMG_4040.JPG",
      "nuggets-plate": "IMG_4047.JPG",
      "family-club-chicken": "IMG_3920.JPG",
      "family-club-beef": "IMG_4043.JPG",
      "fries-box": "IMG_4046.JPG",
      "potato-balls": "IMG_4047.JPG",
      "kids-nuggets": "IMG_4047.JPG",
      "kids-fries": "IMG_4046.JPG",
      "samosa-vegetable-pack": "IMG_3915.JPG",
      "samosa-cheese-pack": "IMG_3852.JPG",
      "samosa-corn-pack": "IMG_3852.JPG",
      "samosa-chicken-pack": "IMG_3852.JPG",
      "samosa-combo": "IMG_3915.JPG",
      "aloo-ball-pack": "IMG_4047.JPG",
      "chapathy-pack": "IMG_3850.JPG",
      "poori-pack": "IMG_3851.JPG",
    };
    const itemVideos = {
      "karak-tea": "cb79652b-d29d-4ce5-838b-1079a5189b8b.mp4",
      "karak-flask-special": "116c314c-c7f0-4c66-a19f-b08e681d6768.mp4",
      "mojito-classic": "0b681542-231d-4425-9f08-6463b8d9dee0.mp4",
      "samosa-combo": "985231161816533.mp4",
    };
    const itemPhotos = {
      "fresh-orange": pexelsPhoto(6412586),
      "pure-orange": pexelsPhoto(6412586),
      "karak-tea": pexelsPhoto(34324342),
      "karak-flask-special": pexelsPhoto(5988424),
      "ladd-custard-drink": pexelsPhoto(18419702),
      horlicks: pexelsPhoto(20643516),
      boost: pexelsPhoto(20643516),
      "arabic-coffee": pexelsPhoto(17473024),
      "turkish-coffee": pexelsPhoto(15435922),
      cappuccino: pexelsPhoto(17473024),
      "hot-chocolate": pexelsPhoto(18419702),
      "zaatar-drink": pexelsPhoto(28836251),
      "turmeric-milk": pexelsPhoto(18419702),
      "saffron-milk": pexelsPhoto(18419702),
      "saffron-karak": pexelsPhoto(34324342),
      "karkadi-hibiscus-tea": pexelsPhoto(17321332),
      "hibiscus-passion": pexelsPhoto(17612801),
      "hibiscus-mango": pexelsPhoto(17612829),
      "hibiscus-orange": pexelsPhoto(6412586),
      "hibiscus-pineapple": "pexels-shameel-mukkath-3421394-5817623.jpg",
      "hibiscus-lemon": "pexels-beyza-sukran-demi-rbas-730252876-33107433.jpg",
      "hibiscus-blue-lagoon": pexelsPhoto(17321327),
      "hibiscus-strawberry": pexelsPhoto(17321274),
      "ghori-kabab": pexelsPhoto(7353388),
      "ghori-chicken-kabab": pexelsPhoto(7353388),
      "boil-egg": pexelsPhoto(7936659),
      "club-egg": pexelsPhoto(27558294),
      "club-chicken": pexelsPhoto(33014391),
      "club-beef": pexelsPhoto(33014391),
      "egg-sandwich": pexelsPhoto(31150225),
      "egg-tomato-sandwich": pexelsPhoto(27558294),
      "chicken-nuggets-sandwich": pexelsPhoto(10183543),
      "sausage-sandwich": pexelsPhoto(37295532),
      "thamiya-sandwich": pexelsPhoto(6546027),
      "liver-sandwich": pexelsPhoto(8696528),
      "malgoum-egg": pexelsPhoto(38644476),
      "malgoum-chips-oman": pexelsPhoto(23996340),
      "malgoum-sunshine": pexelsPhoto(5112578),
      "malgoum-zinger": pexelsPhoto(39994569),
      "malgoum-nuggets": pexelsPhoto(27744717),
      "malgoum-fillet": pexelsPhoto(29306505),
      "malgoum-samosa": pexelsPhoto(13522854),
      "malgoum-nutella-cheese": pexelsPhoto(9181648),
      "malgoum-nutella": pexelsPhoto(4869465),
      "malgoum-banana-nutella": pexelsPhoto(34644336),
      "malgoum-honey": pexelsPhoto(38718375),
      "mojito-blue": pexelsPhoto(17321327),
      "mojito-strawberry": pexelsPhoto(17321274),
      "mojito-mango": pexelsPhoto(17612829),
      "mojito-passion": pexelsPhoto(14930536),
      "fresh-watermelon": pexelsPhoto(11009203),
      "fresh-kiwi": pexelsPhoto(28053226),
      "ice-cream-chocolate": pexelsPhoto(39706407),
      "ice-cream-banana": pexelsPhoto(6463660),
      "ice-cream-mango": pexelsPhoto(6463660),
      "ice-cream-apple": pexelsPhoto(6463660),
      "ice-cream-avocado": pexelsPhoto(17878237),
      "chicken-burger": pexelsPhoto(15076692),
      "beef-burger": pexelsPhoto(6088519),
      "chicken-fillet-sandwich": pexelsPhoto(15476362),
      "chicken-mince-sandwich": pexelsPhoto(9211149),
      "beef-fillet-zinger": pexelsPhoto(1633495),
      "sausage-zinger": pexelsPhoto(4637735),
      "chicken-burger-box": pexelsPhoto(34421467),
      "beef-burger-box": pexelsPhoto(34421467),
      "club-sandwich-plate": pexelsPhoto(33014391),
      "family-club-chicken": pexelsPhoto(33014391),
      "family-club-beef": pexelsPhoto(33014391),
      "nuggets-plate": pexelsPhoto(10183543),
      "kids-nuggets": pexelsPhoto(28525152),
      "kids-fries": pexelsPhoto(29653205),
      "potato-balls": pexelsPhoto(39572220),
      "aloo-ball-pack": pexelsPhoto(39572220),
      "chapathy-pack": pexelsPhoto(12427834),
      "poori-pack": pexelsPhoto(12427834)
    };
    const categoryPhotos = {
      "karak-hot-beverages": pexelsPhoto(34324342),
      "hibiscus-tea": pexelsPhoto(17321332),
      "fresh-juices": pexelsPhoto(31822992),
      "pure-juices": pexelsPhoto(31822992),
      sarbath: pexelsPhoto(17321332),
      "fruit-ice-cream": pexelsPhoto(6463660),
      "milk-shakes": pexelsPhoto(6463660),
      mojitos: pexelsPhoto(8477299),
      "ghori-special": pexelsPhoto(31822992),
      sandwiches: pexelsPhoto(34421468),
      "club-sandwiches": pexelsPhoto(8478399),
      malgoum: pexelsPhoto(5112578),
      "mini-roomi": pexelsPhoto(34421468),
      plates: pexelsPhoto(10183543),
      bakery: pexelsPhoto(29037266)
    };
    const flavorKeys = Object.keys(flavorPhotos).sort((first, second) => second.length - first.length);
    const polishedItemPhotos = {
      "shake-strawberry": "polished-strawberry-shake.jpg",
      "shake-mango": "polished-mango-shake.jpg",
      "ghori-mango-pieces": "polished-mango-ghori.jpg",
      "fresh-papaya": "polished-papaya-juice.jpg",
      "fresh-pomegranate": "polished-pomegranate-juice.jpg",
      "fresh-grape": "polished-grape-juice.jpg",
      "pure-carrot": "polished-carrot-juice.jpg",
      "mojito-classic": "polished-watermarked-mojitos.jpg",
      "chapathy-pack": "polished-chapathi-stack.jpg",
      "malgoum-egg": "polished-parotta.jpg",
      "fries-box": "polished-fries.jpg",
      "kids-fries": "polished-fries.jpg",
      "chicken-burger": "polished-chicken-burger.jpg"
    };
    const drinkCategories = new Set([
      "fresh-juices", "pure-juices", "sarbath", "hibiscus-tea", "fruit-ice-cream",
      "milk-shakes", "mojitos", "ghori-special"
    ]);

    function getItemPhoto(item) {
      if (polishedItemPhotos[item.id]) return polishedItemPhotos[item.id];
      if (restaurantItemPhotos[item.id]) return restaurantItemPhotos[item.id];
      if (itemPhotos[item.id]) return itemPhotos[item.id];
      if (item.id.includes("samosa")) return pexelsPhoto(29037266);
      if (item.id.includes("burger")) return pexelsPhoto(7715715);

      const flavor = flavorKeys.find((key) => item.id.includes(key));
      if (flavor && drinkCategories.has(item.cat)) return flavorPhotos[flavor];
      return categoryPhotos[item.cat] || null;
    }
  function localImageFor(item) {
    const image = getItemPhoto(item);
    if (!image) return null;
    if (!image.startsWith('http')) {
      return Object.hasOwn(polishedItemPhotos, item.id)
        ? `assets/menu/${image}`
        : Object.hasOwn(restaurantItemPhotos, item.id)
          ? `assets/restaurant-media/${image}`
          : `assets/menu/${image}`;
    }
    const photoId = image.match(/\/photos\/(\d+)\//)?.[1];
    return photoId ? `assets/menu/pexels-${photoId}.jpg` : null;
  }

  function localVideoFor(item) {
    const video = itemVideos[item.id];
    return video ? `assets/restaurant-media/${video}` : null;
  }

  return { getItemPhoto, localImageFor, localVideoFor };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = imageData;
if (typeof window !== 'undefined') window.KarakGhoriMenuImages = imageData;
