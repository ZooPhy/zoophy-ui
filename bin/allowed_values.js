'use strict';

const VIRUSES = [
  {
    name: 'Select Virus...',
    tax_id: 0,
    genes: [
    ]
  },
  {
    name: 'Influenza A',
    tax_id: 197911,
    genes: [
      'PB2',
      'PB1',
      'PA',
      'HA',
      'NP',
      'NA',
      'M',
      'NS'
    ]
  },
  {
    name: 'Influenza B',
    tax_id: 197912,
    genes: [
      'PB2',
      'PB1',
      'PA',
      'HA',
      'NP',
      'NA',
      'M',
      'NS'
    ]
  },
  {
    name: 'Influenza C',
    tax_id: 197913,
    genes: [
      'PB2',
      'PB1',
      'PA',
      'HEF',
      'NP',
      'M',
      'NS'
    ]
  },
  {
    name: 'Ebola',
    tax_id: 186536,
    genes: [
      'NP',
      'VP35',
      'VP40',
      'GP',
      'VP30',
      'VP24',
      'L'
    ]
  },
  {
    name: 'MERS-CoV',
    tax_id: 1335626,
    genes: [
      'M',
      'E'
    ]
  },
  {
    name: 'Rabies',
    tax_id: 11292,
    genes: [
      'N',
      'P',
      'M',
      'G',
      'L'
    ]
  },
  {
    name: 'West Nile',
    tax_id: 11082,
    genes: [
      'C',
      'M',
      'E',
      'NS'
    ]
  },
  {
    name: 'Zika',
    tax_id: 64320,
    genes: [
      'C',
      'M',
      'E',
      'NS'
    ]
  }
];

const MIN_SEGMENT_LENGTH = {
  197911: {
    PB2 : '2280',
    PB1 : '2274',
    PA: '2151',
    HA: '1659',
    NP: '1494',
    NA: '1341',
    M: '982',
    NS: '823'

  },
  197912: {
    PB2 : '2259',
    PB1 : '2313',
    PA: '2178',
    HA: '1749',
    NP: '1683',
    NA: '1398',
    M: '1076',
    NS: '1024'
  },
  197913: {
    PB2 : '2325',
    PB1 : '2265',
    PA: '2130',
    HA: '1965',
    NP: '1698',
    NA: '1125',
    M: '862'
  }
};

const INFLUENZA_A_SUB_TYPE_IDS = [
  [114727, 114728, 286279, 352775, 352776, 222770, 571502, 385680, 170500, 0, 0], //H1
	[114730, 114729, 114731, 352777, 282134, 370290, 286284, 114732, 114733, 0, 0], //H2
	[157802, 119210, 215851, 136477, 136481, 215855, 547380, 119211, 333276, 0, 0], //H3
	[282148, 299327, 286286, 222768, 309406, 102800, 418387, 129779, 284164, 0, 0], //H4
	[102793, 119220, 119221, 342224, 465975, 329376, 273303, 232441, 140020, 0, 0], //H5
	[119212, 119213, 333277, 184002, 184006, 222769, 184012, 184009, 129778, 0, 0], //H6
  [119216, 119214, 119215, 325678, 286295, 476651, 119218, 119217, 333278, 0, 0], //H7
	[571503, 402586, 475602, 142943, 311174, 1316904, 551228, 1082910, 0, 0, 0], //H8
	[147762, 102796, 147765, 352778, 187402, 221119, 147760, 286287, 136484, 0, 0], //H9
	[352769, 402585, 352770, 222772, 183666, 352771, 102801, 286285, 136506, 0, 0], //H10
	[127960, 286294, 352772, 286292, 475601, 195471, 437442, 129771, 129772, 0, 0], //H11
	[142949, 397549, 546801, 142947, 142951, 416802, 575460, 286293, 352773, 0, 0], //H12
	[656062, 286281, 222773, 1396558, 0, 150171, 286280, 546800, 352774, 0, 0], //H13
	[0, 1346489, 488106, 1962117, 309433, 309405, 1826661, 1261419, 0, 0, 0], //H14
	[0, 359920, 0, 1084500, 2004355, 447195, 1569252, 173712, 173714, 0, 0], //H15
  [0, 0, 304360, 0, 0, 0, 0, 2004353, 1313083, 0, 0], //H16
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1129344, 0], //H17
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1249503] //H18
];

const CONTINENTS = [
  {
      name: 'All',
      geoname_id: 1,
      countries: []
  },
  {
    name: 'Asia',
    geoname_id: 6255147,
    countries: [
      {
        name: 'Afghanistan',
        geoname_id: 1149361,
        regions: null
      },
      {
        name: 'Armenia',
        geoname_id: 174982,
        regions: null
      },
      {
        name: 'Azerbaijan',
        geoname_id: 587116,
        regions: null
      },
      {
        name: 'Bangladesh',
        geoname_id: 1210997,
        regions: null
      },
      {
        name: 'Bahrain',
        geoname_id: 290291,
        regions: null
      },
      {
        name: 'Brunei',
        geoname_id: 1820814,
        regions: null
      },
      {
        name: 'Bhutan',
        geoname_id: 1252634,
        regions: null
      },
      {
        name: 'Burma',
        geoname_id: 1327865,
        regions: null
      },
      {
        name: 'Cocos Islands',
        geoname_id: 1547376,
        regions: null
      },
      {
        name: 'China',
        geoname_id: 1814991,
        regions: [
          {
            name: 'Anhui',
            geoname_id: 1818058
          },
          {
            name: 'Beijing',
            geoname_id: 2038349
          },
          {
            name: 'Chongqing',
            geoname_id: 1814905
          },
          {
            name: 'Fujian',
            geoname_id: 1811017
          },
          {
            name: 'Gansu',
            geoname_id: 1810676
          },
          {
            name: 'Guangdong',
            geoname_id: 1809935
          },
          {
            name: 'Guangxi',
            geoname_id: 1809867
          },
          {
            name: 'Guizhou',
            geoname_id: 1809445
          },
          {
            name: 'Hainan',
            geoname_id: 1809054
          },
          {
            name: 'Hebei',
            geoname_id: 1808773
          },
          {
            name: 'Heilongjiang',
            geoname_id: 2036965
          },
          {
            name: 'Henan',
            geoname_id: 1808520
          },
          {
            name: 'Hongkong',
            geoname_id: 1819730
          },
          {
            name: 'Hubei',
            geoname_id: 1806949
          },
          {
            name: 'Hunan',
            geoname_id: 1806691
          },
          {
            name: 'Jiangsu',
            geoname_id: 1806260
          },
          {
            name: 'Jiangxi',
            geoname_id: 1806222
          },
          {
            name: 'Jilin',
            geoname_id: 2036500
          },
          {
            name: 'Liaoning',
            geoname_id: 2036115
          },
          {
            name: 'Macau',
            geoname_id: 1821275
          },
          {
            name: 'Nei Mongol',
            geoname_id: 2035607
          },
          {
            name: 'Ningxia',
            geoname_id: 1799355
          },
          {
            name: 'Qinghai',
            geoname_id: 1280239
          },
          {
            name: 'Shaanxi',
            geoname_id: 1796480
          },
          {
            name: 'Shandong',
            geoname_id: 1796328
          },
          {
            name: 'Shanghai',
            geoname_id: 1796231
          },
          {
            name: 'Shanxi',
            geoname_id: 1795912
          },
          {
            name: 'Sichuan',
            geoname_id: 1794299
          },
          {
            name: 'Tianjin',
            geoname_id: 1792943
          },
          {
            name: 'Tibet',
            geoname_id: 1279685
          },
          {
            name: 'Xinjiang',
            geoname_id: 1529047
          },
          {
            name: 'Yunnan',
            geoname_id: 1785694
          },
          {
            name: 'Zhejiang',
            geoname_id: 1784764
          }
        ]
      },
      {
        name: 'Christmas Island',
        geoname_id: 2078138,
        regions: null
      },
      {
        name: 'Georgia',
        geoname_id: 614540,
        regions: null
      },
      {
        name: 'Indonesia',
        geoname_id: 1643084,
        regions: null
      },
      {
        name: 'Israel',
        geoname_id: 294640,
        regions: null
      },
      {
        name: 'India',
        geoname_id: 1269750,
        regions: null
      },
      {
        name: 'Iraq',
        geoname_id: 99237,
        regions: null
      },{
        name: 'Iran',
        geoname_id: 130758,
        regions: null
      },
      {
        name: 'Jordan',
        geoname_id: 248816,
        regions: null
      },
      {
        name: 'Japan',
        geoname_id: 1861060,
        regions: null
      },
      {
        name: 'Kyrgyzstan',
        geoname_id: 1527747,
        regions: null
      },
      {
        name: 'Cambodia',
        geoname_id: 1831722,
        regions: null
      },
      {
        name: 'North Korea',
        geoname_id: 1873107,
        regions: null
      },
      {
        name: 'South Korea',
        geoname_id: 1835841,
        regions: null
      },
      {
        name: 'Kuwait',
        geoname_id: 285570,
        regions: null
      },
      {
        name: 'Kazakhstan',
        geoname_id: 1522867,
        regions: null
      },
      {
        name: 'Laos',
        geoname_id: 1655842,
        regions: null
      },
      {
        name: 'Lebanon',
        geoname_id: 272103,
        regions: null
      },
      {
        name: 'Sri Lanka',
        geoname_id: 1227603,
        regions: null
      },
      {
        name: 'Mongolia',
        geoname_id: 2029969,
        regions: null
      },
      {
        name: 'Maldives',
        geoname_id: 1282028,
        regions: null
      },
      {
        name: 'Malaysia',
        geoname_id: 1733045,
        regions: null
      },
      {
        name: 'Nepal',
        geoname_id: 1282988,
        regions: null
      },
      {
        name: 'Oman',
        geoname_id: 286963,
        regions: null
      },
      {
        name: 'Philippines',
        geoname_id: 1694008,
        regions: null
      },
      {
        name: 'Pakistan',
        geoname_id: 1168579,
        regions: null
      },
      {
        name: 'Palestine',
        geoname_id: 6254930,
        regions: null
      },
      {
        name: 'Qatar',
        geoname_id: 289688,
        regions: null
      },
      {
        name: 'Saudi Arabia',
        geoname_id: 102358,
        regions: null
      },
      {
        name: 'Singapore',
        geoname_id: 1880251,
        regions: null
      },
      {
        name: 'Syria',
        geoname_id: 163843,
        regions: null
      },
      {
        name: 'Thailand',
        geoname_id: 1605651,
        regions: null
      },
      {
        name: 'Tajikistan',
        geoname_id: 1220409,
        regions: null
      },
      {
        name: 'Turkmenistan',
        geoname_id: 1218197,
        regions: null
      },
      {
        name: 'Turkey',
        geoname_id: 298795,
        regions: null
      },
      {
        name: 'Taiwan',
        geoname_id: 1668284,
        regions: null
      },
      {
        name: 'United Arab Emirates',
        geoname_id: 290557,
        regions: null
      },
      {
        name: 'Uzbekistan',
        geoname_id: 1512440,
        regions: null
      },
      {
        name: 'Vietnam',
        geoname_id: 1562822,
        regions: null
      },
      {
        name: 'Yemen',
        geoname_id: 69543,
        regions: null
      }
    ]
  },
  {
    name: 'Africa',
    geoname_id: 6255146,
    countries: [
      {
        name: 'Algeria',
        geoname_id: 2589581,
        regions: null
      },
      {
        name: 'Angola',
        geoname_id: 3351879,
        regions: null
      },
      {
        name: 'Burkina Faso',
        geoname_id: 2361809,
        regions: null
      },
      {
        name: 'Burundi',
        geoname_id: 433561,
        regions: null
      },
      {
        name: 'Benin',
        geoname_id: 2395170,
        regions: null
      },
      {
        name: 'Botswana',
        geoname_id: 933860,
        regions: null
      },
      {
        name: 'Central African Republic',
        geoname_id: 239880,
        regions: null
      },
      {
        name: 'Chad',
        geoname_id: 2434508,
        regions: null
      },
      {
        name: 'Congo',
        geoname_id: 2260494,
        regions: null
      },
      {
        name: 'Côte d’Ivoire',
        geoname_id: 2287781,
        regions: null
      },
      {
        name: 'Cameroon',
        geoname_id: 2233387,
        regions: null
      },
      {
        name: 'Cabo Verde',
        geoname_id: 3374766,
        regions: null
      },
      {
        name: 'Democratic Congo',
        geoname_id: 203312,
        regions: null
      },
      {
        name: 'Djibouti',
        geoname_id: 223816,
        regions: null
      },
      {
        name: 'Egypt',
        geoname_id: 357994,
        regions: [
          {
            name: 'Alexandria',
            geoname_id: 361059
          },
          {
            name: 'Aswan',
            geoname_id: 359787
          },
          {
            name: 'Asyut',
            geoname_id: 359781
          },
          {
            name: 'Beheira',
            geoname_id: 361370
          },
          {
            name: 'Beni Suef',
            geoname_id: 359171
          },
          {
            name: 'Cairo',
            geoname_id: 360631
          },
          {
            name: 'Dakahlia',
            geoname_id: 361849
          },
          {
            name: 'Damietta',
            geoname_id: 358044
          },
          {
            name: 'Faiyum',
            geoname_id: 361323
          },
          {
            name: 'Gharbia',
            geoname_id: 361294
          },
          {
            name: 'Giza',
            geoname_id: 360997
          },
          {
            name: 'Ismailia',
            geoname_id: 361056
          },
          {
            name: 'Kafr el-Sheikh',
            geoname_id: 354500
          },
          {
            name: 'Luxor',
            geoname_id: 7603259
          },
          {
            name: 'Matruh',
            geoname_id: 352603
          },
          {
            name: 'Minya',
            geoname_id: 360688
          },
          {
            name: 'Monufia',
            geoname_id: 360689
          },
          {
            name: 'New Valley',
            geoname_id: 360483
          },
          {
            name: 'North Sinai',
            geoname_id: 349401
          },
          {
            name: 'Port Said',
            geoname_id: 358617
          },
          {
            name: 'Qalyubia',
            geoname_id: 360621
          },
          {
            name: 'Qena',
            geoname_id: 350546
          },
          {
            name: 'Red Sea',
            geoname_id: 361468
          },
          {
            name: 'Sharqia',
            geoname_id: 360016
          },
          {
            name: 'Sohag',
            geoname_id: 347794
          },
          {
            name: 'South Sinai',
            geoname_id: 355182
          },
          {
            name: 'Suez',
            geoname_id: 359797
          }
        ]
      },
      {
        name: 'Eritrea',
        geoname_id: 338010,
        regions: null
      },
      {
        name: 'Ethiopia',
        geoname_id: 337996,
        regions: null
      },
      {
        name: 'Gabon',
        geoname_id: 2400553,
        regions: null
      },
      {
        name: 'Ghana',
        geoname_id: 2300660,
        regions: null
      },
      {
        name: 'Gambia',
        geoname_id: 2413451,
        regions: null
      },
      {
        name: 'Guinea',
        geoname_id: 2420477,
        regions: null
      },
      {
        name: 'Equatorial Guinea',
        geoname_id: 2309096,
        regions: null
      },
      {
        name: 'Guinea-Bissau',
        geoname_id: 2372248,
        regions: null
      },
      {
        name: 'Kenya',
        geoname_id: 192950,
        regions: null
      },
      {
        name: 'Comoros',
        geoname_id: 921929,
        regions: null
      },
      {
        name: 'Liberia',
        geoname_id: 2275384,
        regions: null
      },
      {
        name: 'Lesotho',
        geoname_id: 932692,
        regions: null
      },
      {
        name: 'Libya',
        geoname_id: 2215636,
        regions: null
      },
      {
        name: 'Mayotte',
        geoname_id: 1024031,
        regions: null
      },
      {
        name: 'Morocco',
        geoname_id: 2542007,
        regions: null
      },
      {
        name: 'Madagascar',
        geoname_id: 1062947,
        regions: null
      },
      {
        name: 'Mali',
        geoname_id: 2453866,
        regions: null
      },
      {
        name: 'Mauritania',
        geoname_id: 2378080,
        regions: null
      },
      {
        name: 'Mauritius',
        geoname_id: 934292,
        regions: null
      },
      {
        name: 'Malawi',
        geoname_id: 927384,
        regions: null
      },
      {
        name: 'Mozambique',
        geoname_id: 1036973,
        regions: null
      },
      {
        name: 'Namibia',
        geoname_id: 3355338,
        regions: null
      },
      {
        name: 'Niger',
        geoname_id: 2440476,
        regions: null
      },
      {
        name: 'Nigeria',
        geoname_id: 2328926,
        regions: null
      },
      {
        name: 'Reunion',
        geoname_id: 935317,
        regions: null
      },
      {
        name: 'Rwanda',
        geoname_id: 49518,
        regions: null
      },
      {
        name: 'Seychelles',
        geoname_id: 241170,
        regions: null
      },
      {
        name: 'Sudan',
        geoname_id: 366755,
        regions: null
      },
      {
        name: 'Saint Helena',
        geoname_id: 3370751,
        regions: null
      },
      {
        name: 'Sierra Leone',
        geoname_id: 2403846,
        regions: null
      },
      {
        name: 'Senegal',
        geoname_id: 2245662,
        regions: null
      },
      {
        name: 'Somalia',
        geoname_id: 51537,
        regions: null
      },
      {
        name: 'South Sudan',
        geoname_id: 7909807,
        regions: null
      },
      {
        name: 'Sao Tome and Principe',
        geoname_id: 2410758,
        regions: null
      },
      {
        name: 'Swaziland',
        geoname_id: 934841,
        regions: null
      },
      {
        name: 'Togo',
        geoname_id: 2363686,
        regions: null
      },
      {
        name: 'Tunisia',
        geoname_id: 2464461,
        regions: null
      },
      {
        name: 'Tanzania',
        geoname_id: 149590,
        regions: null
      },
      {
        name: 'Uganda',
        geoname_id: 226074,
        regions: null
      },
      {
        name: 'South Africa',
        geoname_id: 953987,
        regions: null
      },
      {
        name: 'Western Sahara',
        geoname_id: 2461445,
        regions: null
      },
      {
        name: 'Zambia',
        geoname_id: 895949,
        regions: null
      },
      {
        name: 'Zimbabwe',
        geoname_id: 878675,
        regions: null
      }
    ]
  },
  {
    name: 'Europe',
    geoname_id: 6255148,
    countries: [
      {
        name: 'Andorra',
        geoname_id: 3041565,
        regions: null
      },
      {
        name: 'Albania',
        geoname_id: 783754,
        regions: null
      },
      {
        name: 'Austria',
        geoname_id: 2782113,
        regions: null
      },
      {
        name: 'Bosnia and Herzegovina',
        geoname_id: 3277605,
        regions: null
      },
      {
        name: 'Belgium',
        geoname_id: 2802361,
        regions: null
      },
      {
        name: 'Bulgaria',
        geoname_id: 732800,
        regions: null
      },
      {
        name: 'Belarus',
        geoname_id: 630336,
        regions: null
      },
      {
        name: 'Switzerland',
        geoname_id: 2658434,
        regions: null
      },
      {
        name: 'Cyprus',
        geoname_id: 146669,
        regions: null
      },
      {
        name: 'Czech Republic',
        geoname_id: 3077311,
        regions: null
      },
      {
        name: 'Germany',
        geoname_id: 2921044,
        regions: null
      },
      {
        name: 'Denmark',
        geoname_id: 2623032,
        regions: null
      },
      {
        name: 'Estonia',
        geoname_id: 453733,
        regions: null
      },
      {
        name: 'Spain',
        geoname_id: 2510769,
        regions: null
      },
      {
        name: 'Finland',
        geoname_id: 660013,
        regions: null
      },
      {
        name: 'Faroe Islands',
        geoname_id: 2622320,
        regions: null
      },
      {
        name: 'France',
        geoname_id: 3017382,
        regions: null
      },
      {
        name: 'United Kingdom',
        geoname_id: 2635167,
        regions: null
      },
      {
        name: 'Guernsey',
        geoname_id: 3042362,
        regions: null
      },
      {
        name: 'Gibraltar',
        geoname_id: 2411586,
        regions: null
      },
      {
        name: 'Greece',
        geoname_id: 390903,
        regions: null
      },
      {
        name: 'Croatia',
        geoname_id: 3202326,
        regions: null
      },
      {
        name: 'Hungary',
        geoname_id: 719819,
        regions: null
      },
      {
        name: 'Ireland',
        geoname_id: 2963597,
        regions: null
      },
      {
        name: 'Isle of Man',
        geoname_id: 3042225,
        regions: null
      },
      {
        name: 'Iceland',
        geoname_id: 2629691,
        regions: null
      },
      {
        name: 'Italy',
        geoname_id: 3175395,
        regions: null
      },
      {
        name: 'Jersey',
        geoname_id: 3042142,
        regions: null
      },
      {
        name: 'Liechtenstein',
        geoname_id: 3042058,
        regions: null
      },
      {
        name: 'Lithuania',
        geoname_id: 597427,
        regions: null
      },
      {
        name: 'Luxembourg',
        geoname_id: 2960313,
        regions: null
      },
      {
        name: 'Latvia',
        geoname_id: 458258,
        regions: null
      },
      {
        name: 'Monaco',
        geoname_id: 2993457,
        regions: null
      },
      {
        name: 'Moldova',
        geoname_id: 617790,
        regions: null
      },
      {
        name: 'Montenegro',
        geoname_id: 3194884,
        regions: null
      },
      {
        name: 'Macedonia',
        geoname_id: 718075,
        regions: null
      },
      {
        name: 'Malta',
        geoname_id: 2562770,
        regions: null
      },
      {
        name: 'Netherlands',
        geoname_id: 2750405,
        regions: null
      },
      {
        name: 'Norway',
        geoname_id: 3144096,
        regions: null
      },
      {
        name: 'Poland',
        geoname_id: 798544,
        regions: null
      },
      {
        name: 'Portugal',
        geoname_id: 2264397,
        regions: null
      },
      {
        name: 'România',
        geoname_id: 798549,
        regions: null
      },
      {
        name: 'Serbia',
        geoname_id: 6290252,
        regions: null
      },
      {
        name: 'Russia',
        geoname_id: 2017370,
        regions: [
          {
            name: 'Amur',
            geoname_id: 2027748
          },
          {
            name: 'Arkhangelsk',
            geoname_id: 581043
          },
          {
            name: 'Astrakhan',
            geoname_id: 580491
          },
          {
            name: 'Belgorod',
            geoname_id: 578071
          },
          {
            name: 'Bryansk',
            geoname_id: 571473
          },
          {
            name: 'Chelyabinsk',
            geoname_id: 1508290
          },
          {
            name: 'Irkutsk',
            geoname_id: 2023468
          },
          {
            name: 'Ivanovo',
            geoname_id: 555235
          },
          {
            name: 'Kaliningrad',
            geoname_id: 554230
          },
          {
            name: 'Kaluga',
            geoname_id: 553899
          },
          {
            name: 'Kemerovo',
            geoname_id: 1503900
          },
          {
            name: 'Kirov',
            geoname_id: 548389
          },
          {
            name: 'Kostroma',
            geoname_id: 543871
          },
          {
            name: 'Kurgan',
            geoname_id: 1501312
          },
          {
            name: 'Kursk',
            geoname_id: 538555
          },
          {
            name: 'Leningrad',
            geoname_id: 536199
          },
          {
            name: 'Lipetsk',
            geoname_id: 535120
          },
          {
            name: 'Magadan',
            geoname_id: 2123627
          },
          {
            name: 'Moscow',
            geoname_id: 524894
          },
          {
            name: 'Murmansk',
            geoname_id: 524304
          },
          {
            name: 'Nizhny Novgorod',
            geoname_id: 559838
          },
          {
            name: 'Novgorod',
            geoname_id: 519324
          },
          {
            name: 'Novosibirsk',
            geoname_id: 1496745
          },
          {
            name: 'Omsk',
            geoname_id: 1496152
          },
          {
            name: 'Orenburg',
            geoname_id: 515001
          },
          {
            name: 'Oryol',
            geoname_id: 514801
          },
          {
            name: 'Penza',
            geoname_id: 511555
          },
          {
            name: 'Pskov',
            geoname_id: 504338
          },
          {
            name: 'Rostov',
            geoname_id: 501165
          },
          {
            name: 'Ryazan',
            geoname_id: 500059
          },
          {
            name: 'Sakhalin',
            geoname_id: 2121529
          },
          {
            name: 'Samara',
            geoname_id: 499068
          },
          {
            name: 'Saratov',
            geoname_id: 498671
          },
          {
            name: 'Smolensk',
            geoname_id: 491684
          },
          {
            name: 'Sverdlovsk',
            geoname_id: 1490542
          },
          {
            name: 'Tambov',
            geoname_id: 484638
          },
          {
            name: 'Tomsk',
            geoname_id: 1489421
          },
          {
            name: 'Tver',
            geoname_id: 480041
          },
          {
            name: 'Tula',
            geoname_id: 480508
          },
          {
            name: 'Tyumen',
            geoname_id: 1488747
          },
          {
            name: 'Ulyanovsk',
            geoname_id: 479119
          },
          {
            name: 'Vladimir',
            geoname_id: 826294
          },
          {
            name: 'Volgograd',
            geoname_id: 472755
          },
          {
            name: 'Vologda',
            geoname_id: 472454
          },
          {
            name: 'Voronezh',
            geoname_id: 472039
          },
          {
            name: 'Yaroslavl',
            geoname_id: 468898
          }
        ]
      },
      {
        name: 'Sweden',
        geoname_id: 2661886,
        regions: null
      },
      {
        name: 'Slovenia',
        geoname_id: 3190538,
        regions: null
      },
      {
        name: 'Slovak Republic',
        geoname_id: 3057568,
        regions: null
      },
      {
        name: 'San Marino',
        geoname_id: 3168068,
        regions: null
      },
      {
        name: 'Ukraine',
        geoname_id: 690791,
        regions: null
      },
      {
        name: 'Vatican City',
        geoname_id: 3164670,
        regions: null
      },
      {
        name: 'Kosovo',
        geoname_id: 831053,
        regions: null
      }
    ]
  },
  {
    name: 'North America',
    geoname_id: 6255149,
    countries: [
      {
        name: 'Antigua and Barbuda',
        geoname_id: 3576396,
        regions: null
      },
      {
        name: 'Anguilla',
        geoname_id: 3573511,
        regions: null
      },
      {
        name: 'Netherlands Antilles',
        geoname_id: 8505032,
        regions: null
      },
      {
        name: 'Aruba',
        geoname_id: 3577279,
        regions: null
      },
      {
        name: 'Barbados',
        geoname_id: 3374084,
        regions: null
      },
      {
        name: 'Saint Barthélemy',
        geoname_id: 3578476,
        regions: null
      },
      {
        name: 'Bermuda',
        geoname_id: 3573345,
        regions: null
      },
      {
        name: 'Caribbean Netherlands',
        geoname_id: 7626844,
        regions: null
      },
      {
        name: 'Bahamas',
        geoname_id: 3572887,
        regions: null
      },
      {
        name: 'Belize',
        geoname_id: 3582678,
        regions: null
      },
      {
        name: 'Canada',
        geoname_id: 6251999,
        regions: [
          {
            name: 'Alberta',
            geoname_id: 5883102
          },
          {
            name: 'British Columbia',
            geoname_id: 5909050
          },
          {
            name: 'Manitoba',
            geoname_id: 6065171
          },
          {
            name: 'New Brunswick',
            geoname_id: 6087430
          },
          {
            name: 'Newfoundland and Labrador',
            geoname_id: 6354959
          },
          {
            name: 'Nova Scotia',
            geoname_id: 6091530
          },
          {
            name: 'Ontario',
            geoname_id: 6093943
          },
          {
            name: 'Prince Edward Island',
            geoname_id: 6113358
          },
          {
            name: 'Quebec',
            geoname_id: 6115047
          },
          {
            name: 'Saskatchewan',
            geoname_id: 6141242
          }
        ]
      },
      {
        name: 'Costa Rica',
        geoname_id: 3624060,
        regions: null
      },
      {
        name: 'Cuba',
        geoname_id: 3562981,
        regions: null
      },
      {
        name: 'Curaçao',
        geoname_id: 7626836,
        regions: null
      },
      {
        name: 'Dominica',
        geoname_id: 3575830,
        regions: null
      },
      {
        name: 'Dominican Republic',
        geoname_id: 3508796,
        regions: null
      },
      {
        name: 'Grenada',
        geoname_id: 3580239,
        regions: null
      },
      {
        name: 'Greenland',
        geoname_id: 3425505,
        regions: null
      },
      {
        name: 'Guadeloupe',
        geoname_id: 3579143,
        regions: null
      },
      {
        name: 'Guatemala',
        geoname_id: 3595528,
        regions: null
      },
      {
        name: 'Honduras',
        geoname_id: 3608932,
        regions: null
      },
      {
        name: 'Haiti',
        geoname_id: 3723988,
        regions: null
      },
      {
        name: 'Jamaica',
        geoname_id: 3489940,
        regions: null
      },
      {
        name: 'Saint Kitts and Nevis',
        geoname_id: 3575174,
        regions: null
      },
      {
        name: 'Cayman Islands',
        geoname_id: 3580718,
        regions: null
      },
      {
        name: 'Saint Lucia',
        geoname_id: 3576468,
        regions: null
      },
      {
        name: 'Saint Martin',
        geoname_id: 3578421,
        regions: null
      },
      {
        name: 'Martinique',
        geoname_id: 3570311,
        regions: null
      },
      {
        name: 'Montserrat',
        geoname_id: 3578097,
        regions: null
      },
      {
        name: 'Mexico',
        geoname_id: 3996063,
        regions: null
      },
      {
        name: 'Nicaragua',
        geoname_id: 3617476,
        regions: null
      },
      {
        name: 'Panama',
        geoname_id: 3703430,
        regions: null
      },
      {
        name: 'Saint Pierre and Miquelon',
        geoname_id: 3424932,
        regions: null
      },
      {
        name: 'Puerto Rico',
        geoname_id: 4566966,
        regions: null
      },
      {
        name: 'El Salvador',
        geoname_id: 3585968,
        regions: null
      },
      {
        name: 'Sint Maarten',
        geoname_id: 7609695,
        regions: null
      },
      {
        name: 'Turks and Caicos Islands',
        geoname_id: 3576916,
        regions: null
      },
      {
        name: 'Trinidad and Tobago',
        geoname_id: 3573591,
        regions: null
      },
      {
        name: 'United States of America',
        geoname_id: 6252001,
        regions: [
          {
            name: 'Alabama',
            geoname_id: 4829764
          },
          {
            name: 'Alaska',
            geoname_id: 5879092
          },
          {
            name: 'Arizona',
            geoname_id: 5551752
          },
          {
            name: 'Arkansas',
            geoname_id: 4099753
          },
          {
            name: 'California',
            geoname_id: 5332921
          },
          {
            name: 'Colorado',
            geoname_id: 5417618
          },
          {
            name: 'Connecticut',
            geoname_id: 4831725
          },
          {
            name: 'Delaware',
            geoname_id: 4142224
          },
          {
            name: 'District of Columbia',
            geoname_id: 4138106
          },
          {
            name: 'Florida',
            geoname_id: 4155751
          },
          {
            name: 'Georgia',
            geoname_id: 4197000
          },
          {
            name: 'Hawaii',
            geoname_id: 5855797
          },
          {
            name: 'Idaho',
            geoname_id: 5596512
          },
          {
            name: 'Illinois',
            geoname_id: 4896861
          },
          {
            name: 'Indiana',
            geoname_id: 4921868
          },
          {
            name: 'Iowa',
            geoname_id: 4862182
          },
          {
            name: 'Kansas',
            geoname_id: 4273857
          },
          {
            name: 'Kentucky',
            geoname_id: 6254925
          },
          {
            name: 'Louisiana',
            geoname_id: 4331987
          },
          {
            name: 'Maine',
            geoname_id: 4971068
          },
          {
            name: 'Maryland',
            geoname_id: 4361885
          },
          {
            name: 'Massachusetts',
            geoname_id: 6254926
          },
          {
            name: 'Michigan',
            geoname_id: 5001836
          },
          {
            name: 'Minnesota',
            geoname_id: 5037779
          },
          {
            name: 'Mississippi',
            geoname_id: 4436296
          },
          {
            name: 'Missouri',
            geoname_id: 4398678
          },
          {
            name: 'Montana',
            geoname_id: 5667009
          },
          {
            name: 'Nebraska',
            geoname_id: 5073708
          },
          {
            name: 'Nevada',
            geoname_id: 5509151
          },
          {
            name: 'New Hampshire',
            geoname_id: 5090174
          },
          {
            name: 'New Jersey',
            geoname_id: 5101760
          },
          {
            name: 'New Mexico',
            geoname_id: 5481136
          },
          {
            name: 'New York',
            geoname_id: 5128638
          },
          {
            name: 'North Carolina',
            geoname_id: 4482348
          },
          {
            name: 'North Dakota',
            geoname_id: 5690763
          },
          {
            name: 'Ohio',
            geoname_id: 5165418
          },
          {
            name: 'Oklahoma',
            geoname_id: 4544379
          },
          {
            name: 'Oregon',
            geoname_id: 5744337
          },
          {
            name: 'Pennsylvania',
            geoname_id: 6254927
          },
          {
            name: 'Rhode Island',
            geoname_id: 5224323
          },
          {
            name: 'South Carolina',
            geoname_id: 4597040
          },
          {
            name: 'South Dakota',
            geoname_id: 5769223
          },
          {
            name: 'Tennessee',
            geoname_id: 4662168
          },
          {
            name: 'Texas',
            geoname_id: 4736286
          },
          {
            name: 'Utah',
            geoname_id: 5549030
          },
          {
            name: 'Vermont',
            geoname_id: 5242283
          },
          {
            name: 'Virginia',
            geoname_id: 6254928
          },
          {
            name: 'Washington',
            geoname_id: 5815135
          },
          {
            name: 'West Virginia',
            geoname_id: 4826850
          },
          {
            name: 'Wisconsin',
            geoname_id: 5279468
          },
          {
            name: 'Wyoming',
            geoname_id: 5843591
          }
        ]
      },
      {
        name: 'Saint Vincent',
        geoname_id: 3577815,
        regions: null
      },
      {
        name: 'British Virgin Islands',
        geoname_id: 3577718,
        regions: null
      },
      {
        name: 'US Virgin Islands',
        geoname_id: 4796775,
        regions: null
      }
    ]
  },
  {
    name: 'South America',
    geoname_id: 6255150,
    countries: [
      {
        name: 'Argentina',
        geoname_id: 3865483,
        regions: null
      },
      {
        name: 'Bolivia',
        geoname_id: 3923057,
        regions: null
      },
      {
        name: 'Brazil',
        geoname_id: 3469034,
        regions: null
      },
      {
        name: 'Chile',
        geoname_id: 3895114,
        regions: null
      },
      {
        name: 'Colombia',
        geoname_id: 3686110,
        regions: null
      },
      {
        name: 'Ecuador',
        geoname_id: 3658394,
        regions: null
      },
      {
        name: 'Falkland Islands',
        geoname_id: 3474414,
        regions: null
      },
      {
        name: 'Guyana',
        geoname_id: 3378535,
        regions: null
      },
      {
        name: 'Paraguay',
        geoname_id: 3437598,
        regions: null
      },
      {
        name: 'Peru',
        geoname_id: 3932488,
        regions: null
      },
      {
        name: 'Suriname',
        geoname_id: 3382998,
        regions: null
      },
      {
        name: 'Uruguay',
        geoname_id: 3439705,
        regions: null
      },
      {
        name: 'Venezuela',
        geoname_id: 3625428,
        regions: null
      }
    ]
  },
  {
    name: 'Oceania',
    geoname_id: 6255151,
    countries: [
      {
        name: 'American Samoa',
        geoname_id: 5880801,
        regions: null
      },
      {
        name: 'Australia',
        geoname_id: 2077456,
        regions: null
      },
      {
        name: 'Cook Islands',
        geoname_id: 1899402,
        regions: null
      },
      {
        name: 'Fiji',
        geoname_id: 2205218,
        regions: null
      },
      {
        name: 'Micronesia',
        geoname_id: 2081918,
        regions: null
      },
      {
        name: 'Guam',
        geoname_id: 4043988,
        regions: null
      },
      {
        name: 'Kiribati',
        geoname_id: 4030945,
        regions: null
      },
      {
        name: 'Marshall Islands',
        geoname_id: 2080185,
        regions: null
      },
      {
        name: 'Northern Mariana Islands',
        geoname_id: 4041468,
        regions: null
      },
      {
        name: 'Nouvelle Calédonie',
        geoname_id: 2139685,
        regions: null
      },
      {
        name: 'Norfolk Island',
        geoname_id: 2155115,
        regions: null
      },
      {
        name: 'Nauru',
        geoname_id: 2110425,
        regions: null
      },
      {
        name: 'Niue',
        geoname_id: 4036232,
        regions: null
      },
      {
        name: 'New Zealand',
        geoname_id: 2186224,
        regions: null
      },
      {
        name: 'French Polynesia',
        geoname_id: 4030656,
        regions: null
      },
      {
        name: 'Papua New Guinea',
        geoname_id: 2088628,
        regions: null
      },
      {
        name: 'Pitcairn Islands',
        geoname_id: 4030699,
        regions: null
      },
      {
        name: 'Palau',
        geoname_id: 1559582,
        regions: null
      },
      {
        name: 'Solomon Islands',
        geoname_id: 2103350,
        regions: null
      },
      {
        name: 'Tokelau',
        geoname_id: 4031074,
        regions: null
      },
      {
        name: 'Timor-Leste',
        geoname_id: 1966436,
        regions: null
      },
      {
        name: 'Tonga',
        geoname_id: 4032283,
        regions: null
      },
      {
        name: 'Tuvalu',
        geoname_id: 2110297,
        regions: null
      },
      {
        name: 'US Minor Outlying Islands',
        geoname_id: 5854968,
        regions: null
      },
      {
        name: 'Vanuatu',
        geoname_id: 2134431,
        regions: null
      },
      {
        name: 'Wallis et Futuna',
        geoname_id: 4034749,
        regions: null
      },
      {
        name: 'Independent Samoa',
        geoname_id: 4034894,
        regions: null
      }
    ]
  }
];

const HOSTS = [
  {
    name: 'All',
    tax_id: 1
  },
  {
    name: 'Avian',
    tax_id: 8782
  },
  {
    name: 'Bat',
    tax_id: 9397
  },
  {
    name: 'Bear',
    tax_id: 9641
  },
  {
    name: 'Bovine',
    tax_id: 9913
  },
  {
    name: 'Camel',
    tax_id: 9836
  },
  {
    name: 'Civet',
    tax_id: 9673
  },
  {
    name: 'Civet Cat',
    tax_id: 9683
  },
  {
    name: 'Dog',
    tax_id: 9615
  },
  {
    name: 'Domestic Cat',
    tax_id: 9685
  },
  {
    name: 'Donkey',
    tax_id: 9793
  },
  {
    name: 'Ferret',
    tax_id: 9669
  },
  {
    name: 'Flat-Faced Bat',
    tax_id: 40230
  },
  {
    name: 'Horse',
    tax_id: 9796
  },
  {
    name: 'Human',
    tax_id: 9606
  },
  {
    name: 'Mosquito',
    tax_id: 7157
  },
  {
    name: 'Mule',
    tax_id: 319699
  },
  {
    name: 'Muskrat',
    tax_id: 10060
  },
  {
    name: 'Panda',
    tax_id: 212257
  },
  {
    name: 'Pika',
    tax_id: 9976
  },
  {
    name: 'Raccoon',
    tax_id: 9654
  },
  {
    name: 'Skunk',
    tax_id: 119825
  },
  {
    name: 'Swine',
    tax_id: 9823
  },
  {
    name: 'Yak',
    tax_id: 30521
  }
];

const AVIAN_HOSTS = [
  {
    name: 'All Avian',
    tax_id: 8782
  },
  {
    name: 'African Stonechat',
    tax_id: 290047
  },
  {
    name: 'American Black Duck',
    tax_id: 75857
  },
  {
    name: 'American Green-Winged Teal',
    tax_id: 75836
  },
  {
    name: 'American Kestrel',
    tax_id: 496005
  },
  {
    name: 'American Robin',
    tax_id: 9188
  },
  {
    name: 'American Widgeon',
    tax_id: 75832
  },
  {
    name: 'Andean Condor',
    tax_id: 8924
  },
  {
    name: 'Arabian Partridge',
    tax_id: 40180
  },
  {
    name: 'Armenian Gull',
    tax_id: 119635
  },
  {
    name: 'Australian Shelduck',
    tax_id: 45638
  },
  {
    name: 'Babbler',
    tax_id: 9173
  },
  {
    name: 'Baikal Teal',
    tax_id: 56278
  },
  {
    name: 'Bald Eagle',
    tax_id: 52644
  },

  {
    name: 'Baltimore Oriole',
    tax_id: 105513
  },
  {
    name: 'Bar-Headed Goose',
    tax_id: 8846
  },
  {
    name: 'Barbary Partridge',
    tax_id: 40177
  },
  {
    name: 'Barnacle Goose',
    tax_id: 184711
  },
  {
    name: 'Barn Swallow',
    tax_id: 43150
  },
  {
    name: 'Bewicks Swan',
    tax_id: 541010
  },
  {
    name: 'Black Kite',
    tax_id: 52810
  },
  {
    name: 'Blackbird',
    tax_id: 9187
  },
  {
    name: 'Black-capped Lory',
    tax_id: 274062
  },
  {
    name: 'Black-crested Bulbul',
    tax_id: 241766
  },
  {
    name: 'Black-headed Gull',
    tax_id: 1192867
  },
  {
    name: 'Black Scoter',
    tax_id: 198026
  },
  {
    name: 'Blue-winged Teal',
    tax_id: 75842
  },
  {
    name: 'Blue Jay',
    tax_id: 28727
  },
  {
    name: 'Brahminy Kite',
    tax_id: 8971
  },
  {
    name: 'Brown-headed Gull',
    tax_id: 328044
  },
  {
    name: 'Budgerigar',
    tax_id: 13146
  },
  {
    name: 'Bufflehead',
    tax_id: 279934
  },
  {
    name: 'Cactus Wren',
    tax_id: 141853
  },
  {
    name: 'Canada Goose',
    tax_id: 8853
  },
  {
    name: 'Canary Islands Kinglet',
    tax_id: 73323
  },
  {
    name: 'Canvasback',
    tax_id: 110915
  },
  {
    name: 'Chattering Lory',
    tax_id: 13114
  },
  {
    name: 'Chicken',
    tax_id: 9031
  },
  {
    name: 'Chukar Partridge',
    tax_id: 9078
  },
  {
    name: 'Cinnamon Teal',
    tax_id: 75840
  },
  {
    name: 'Cockatoo',
    tax_id: 35549
  },
  {
    name: 'Common Eider',
    tax_id: 76058
  },
  {
    name: 'Common Goldeneye',
    tax_id: 107022
  },
  {
    name: 'Common Iora',
    tax_id: 175021
  },
  {
    name: 'Common Kestrel',
    tax_id: 100819
  },
  {
    name: 'Common Mallard',
    tax_id: 8840
  },
  {
    name: 'Common Merganser',
    tax_id: 8880
  },
  {
    name: 'Common Murre',
    tax_id: 13746
  },
  {
    name: 'Common Myna',
    tax_id: 279927
  },
  {
    name: 'Common Pochard',
    tax_id: 219593
  },
  {
    name: 'Common Quail',
    tax_id: 9091
  },
  {
    name: 'Common Rhea',
    tax_id: 8797
  },
  {
    name: 'Common Tern',
    tax_id: 108405
  },
  {
    name: 'Coot',
    tax_id: 9120
  },
  {
    name: 'Cormorant',
    tax_id: 9206
  },
  {
    name: 'Cranes',
    tax_id: 9109
  },
  {
    name: 'Crow',
    tax_id: 30420
  },
  {
    name: 'Curlew Sandpiper',
    tax_id: 217133
  },
  {
    name: 'Desert Cardinal',
    tax_id: 371910
  },
  {
    name: 'Dunlin',
    tax_id: 8919
  },
  {
    name: 'Eagle Owls',
    tax_id: 30460
  },
  {
    name: 'Egyptian Goose',
    tax_id: 30382
  },
  {
    name: 'Emu',
    tax_id: 8790
  },
  {
    name: 'Eurasian Coot',
    tax_id: 9121
  },
  {
    name: 'Eurasian Eagle-Owl',
    tax_id: 30461
  },
  {
    name: 'Eurasian Jackdaw',
    tax_id: 30423
  },
  {
    name: 'Eurasian Sparrowhawk',
    tax_id: 211598
  },
  {
    name: 'Eurasian Teal',
    tax_id: 75839
  },
  {
    name: 'Eurasian Wigeon',
    tax_id: 8838
  },
  {
    name: 'European Herring Gull',
    tax_id: 208483
  },
  {
    name: 'Fairy Bluebird',
    tax_id: 175120
  },
  {
    name: 'Falcon',
    tax_id: 8952
  },
  {
    name: 'Forest Raven',
    tax_id: 1196310
  },
  {
    name: 'Fowl',
    tax_id: 8976
  },
  {
    name: 'Gadwall',
    tax_id: 75861
  },
  {
    name: 'Gambels Quail',
    tax_id: 67773
  },
  {
    name: 'Garganey',
    tax_id: 75856
  },
  {
    name: 'Glaucous Gull',
    tax_id: 119637
  },
  {
    name: 'Golden Pheasant',
    tax_id: 9089
  },
  {
    name: 'Goose',
    tax_id: 8847
  },
  {
    name: 'Goshawk',
    tax_id: 8957
  },
  {
    name: 'Grebe',
    tax_id: 30448
  },
  {
    name: 'Grey Teal',
    tax_id: 45630
  },
  {
    name: 'Great Barbet',
    tax_id: 219518
  },
  {
    name: 'Great Black-Headed Gull',
    tax_id: 126702
  },
  {
    name: 'Gull',
    tax_id: 8910
  },
  {
    name: 'Great Crested Grebe',
    tax_id: 345573
  },
  {
    name: 'Greater Scaup',
    tax_id: 189534
  },
  {
    name: 'Greater Scythebill',
    tax_id: 761979
  },
  {
    name: 'Greater White-Fronted Goose',
    tax_id: 132590
  },
  {
    name: 'Golden-crowned Kinglet',
    tax_id: 13245
  },
  {
    name: 'Goose',
    tax_id: 8847
  },
  {
    name: 'Grebe',
    tax_id: 30448
  },
  {
    name: 'Green Peafowl',
    tax_id: 9050
  },
  {
    name: 'Green-Winged Teal',
    tax_id: 75836
  },
  {
    name: 'Grey Crowned-Crane',
    tax_id: 925459
  },
  {
    name: 'Grey Heron',
    tax_id: 30390
  },
  {
    name: 'Grey Partridge',
    tax_id: 9052
  },
  {
    name: 'Grey Teal',
    tax_id: 45630
  },
  {
    name: 'Greylag Goose',
    tax_id: 8843
  },
  {
    name: 'Guineafowl',
    tax_id: 8990
  },
  {
    name: 'Gull',
    tax_id: 8910
  },
  {
    name: 'Helmeted Guineafowl',
    tax_id: 8996
  },
  {
    name: 'Heron',
    tax_id: 8899
  },
  {
    name: 'Herring Gull',
    tax_id: 35669
  },
  {
    name: 'Hooded Merganser',
    tax_id: 279951
  },
  {
    name: 'Hooded Vulture',
    tax_id: 30399
  },
  {
    name: 'Horned Puffin',
    tax_id: 28702
  },
  {
    name: 'Houbara Bustard',
    tax_id: 172680
  },
  {
    name: 'House Crow',
    tax_id: 701737
  },
  {
    name: 'Iceland Gull',
    tax_id: 118194
  },
  {
    name: 'Indian Peafowl',
    tax_id: 9049
  },
  {
    name: 'Japanese Quail',
    tax_id: 93934
  },
  {
    name: 'Japanese White-Eye',
    tax_id: 36299
  },
  {
    name: 'Junco',
    tax_id: 40213
  },
  {
    name: 'Kalij Pheasant',
    tax_id: 140445
  },
  {
    name: 'Kelp Gull',
    tax_id: 37036
  },
  {
    name: 'Large-Billed Crow',
    tax_id: 36249
  },
  {
    name: 'Laughing Gull',
    tax_id: 126679
  },
  {
    name: 'Least Sandpiper',
    tax_id: 279935
  },
  {
    name: 'Lesser Scaup',
    tax_id: 189533
  },
  {
    name: 'Lesser Kestrel',
    tax_id: 148594
  },
  {
    name: 'Little Egret',
    tax_id: 188379
  },
  {
    name: 'Little Grebe',
    tax_id: 100828
  },
  {
    name: 'Long-tailed Duck',
    tax_id: 197941
  },
  {
    name: 'Magpie',
    tax_id: 34923
  },
  {
    name: 'Mew Gull',
    tax_id: 28681
  },
  {
    name: 'Moorhen',
    tax_id: 9122
  },
  {
    name: 'Mottled Duck',
    tax_id: 75846
  },
  {
    name: 'Munia',
    tax_id: 40156
  },
  {
    name: 'Murre',
    tax_id: 13745
  },
  {
    name: 'Muscovy Duck',
    tax_id: 8855
  },
  {
    name: 'Mute Swan',
    tax_id: 8869
  },
  {
    name: 'Nightingale',
    tax_id: 383689
  },
  {
    name: 'Northern Cardinal',
    tax_id: 98964
  },
  {
    name: 'Northern Pintail',
    tax_id: 28680
  },
  {
    name: 'Northern Shoveler',
    tax_id: 75838
  },
  {
    name: 'Orchard Oriole',
    tax_id: 84829
  },
  {
    name: 'Ostrich',
    tax_id: 8801
  },
  {
    name: 'Owl',
    tax_id: 30458
  },
  {
    name: 'Oystercatcher',
    tax_id: 37576
  },
  {
    name: 'Pacific Golden Plover',
    tax_id: 371922
  },
  {
    name: 'Parakeet',
    tax_id: 13146
  },
  {
    name: 'Parrot',
    tax_id: 9223
  },
  {
    name: 'Peacock',
    tax_id: 171585
  },
  {
    name: 'Pekin Robin',
    tax_id: 36275
  },
  {
    name: 'Pelican',
    tax_id: 30444
  },
  {
    name: 'Penguin',
    tax_id: 9231
  },
  {
    name: 'Peregrine Falcon',
    tax_id: 8954
  },
  {
    name: 'Pheasant',
    tax_id: 9072
  },
  {
    name: 'Philbys Partridge',
    tax_id: 40181
  },
  {
    name: 'Pigeon',
    tax_id: 8930
  },
  {
    name: 'Pink-Footed Goose',
    tax_id: 132585
  },
  {
    name: 'Przewalskis Partridge',
    tax_id: 40179
  },
  {
    name: 'Purple-bellied Lory',
    tax_id: 315430
  },
  {
    name: 'Red-Crested Cardinal',
    tax_id: 181102
  },
  {
    name: 'Red-Crested Pochard',
    tax_id: 30387
  },
  {
    name: 'Red-Necked Stint',
    tax_id: 272047
  },
  {
    name: 'Red-Winged Tinamou',
    tax_id: 30466
  },
  {
    name: 'Redhead',
    tax_id: 30385
  },
  {
    name: 'Red Kite',
    tax_id: 43518
  },
  {
    name: 'Red Knot',
    tax_id: 227173
  },
  {
    name: 'Ring-Billed Gull',
    tax_id: 126683
  },
  {
    name: 'Ring-Necked Duck',
    tax_id: 189535
  },
  {
    name: 'Rock Patridge',
    tax_id: 40178
  },
  {
    name: 'Rook',
    tax_id: 75140
  },
  {
    name: 'Rosy-Billed Pochard',
    tax_id: 541013
  },
  {
    name: 'Ruddy Shelduck',
    tax_id: 45639
  },
  {
    name: 'Ruddy Turnston',
    tax_id: 54971
  },
  {
    name: 'Sabines Gull',
    tax_id: 128050
  },
  {
    name: 'Saker Falcon',
    tax_id: 345164
  },
  {
    name: 'Sanderling',
    tax_id: 279936
  },
  {
    name: 'Semipalmated Sandpiper',
    tax_id: 279961
  },
  {
    name: 'Sharp-Tailed Sandpiper',
    tax_id: 192723
  },
  {
    name: 'Shorebird',
    tax_id: 8906
  },
  {
    name: 'Shrike',
    tax_id: 9193
  },
  {
    name: 'Silver-Eared Mesia',
    tax_id: 201335
  },
  {
    name: 'Slaty-Backed Gull',
    tax_id: 119607
  },
  {
    name: 'Slender-Billed Gull',
    tax_id: 126701
  },
  {
    name: 'Smew',
    tax_id: 107026
  },
  {
    name: 'Snipe',
    tax_id: 8917
  },
  {
    name: 'Snow Goose',
    tax_id: 8849
  },
  {
    name: 'Sooty Tern',
    tax_id: 425648
  },
  {
    name: 'Sparrow',
    tax_id: 9158
  },
  {
    name: 'Spot-Billed Duck',
    tax_id: 75854
  },
  {
    name: 'Spur-Winged Goose',
    tax_id: 658924
  },
  {
    name: 'Starling',
    tax_id: 9172
  },
  {
    name: 'Stellers Eider',
    tax_id: 234623
  },
  {
    name: 'Stork',
    tax_id: 8926
  },
  {
    name: 'Struthio',
    tax_id: 8800
  },
  {
    name: 'Surf Scoter',
    tax_id: 371863
  },
  {
    name: 'Swan',
    tax_id: 8867
  },
  {
    name: 'Tanager',
    tax_id: 62155
  },
  {
    name: 'Thrush',
    tax_id: 9183
  },
  {
    name: 'Tree Sparrow',
    tax_id: 9160
  },
  {
    name: 'Tufted Duck',
    tax_id: 219594
  },
  {
    name: 'Tundra Swan',
    tax_id: 110926
  },
  {
    name: 'Turkey',
    tax_id: 9103
  },
  {
    name: 'Veery',
    tax_id: 159581
  },
  {
    name: 'Velvet Scoter',
    tax_id: 371864
  },
  {
    name: 'Vermilion Cardinal',
    tax_id: 56327
  },
  {
    name: 'Vulture',
    tax_id: 8923
  },
  {
    name: 'Warbler',
    tax_id: 400782
  },
  {
    name: 'Watercock',
    tax_id: 261967
  },
  {
    name: 'Waterfowl',
    tax_id: 8830
  },
  {
    name: 'Waxwing',
    tax_id: 125296
  },
  {
    name: 'Wedge-Tailed Shearwater',
    tax_id: 48683
  },
  {
    name: 'Wheatear',
    tax_id: 245059
  },
  {
    name: 'Whiskered Tern',
    tax_id: 297805
  },
  {
    name: 'White Bellied Bustard',
    tax_id: 89385
  },
  {
    name: 'White-Faced Whistling-Duck',
    tax_id: 8876
  },
  {
    name: 'White-Rumped Munia',
    tax_id: 40157
  },
  {
    name: 'White-Rumped Sandpiper',
    tax_id: 279940
  },
  {
    name: 'White-Winged Scoter',
    tax_id: 371864
  },
  {
    name: 'White Ibis',
    tax_id: 371913
  },
  {
    name: 'Whooper Swan',
    tax_id: 219595
  },
  {
    name: 'Wood Duck',
    tax_id: 8833
  },
  {
    name: 'Wren',
    tax_id: 36278
  },
  {
    name: 'Yellow-billed Stork',
    tax_id: 33586
  }
];

const ALLOWED_VALUES = {
  viruses: VIRUSES,
  influenza_a_sub_type_ids: INFLUENZA_A_SUB_TYPE_IDS,
  continents: CONTINENTS,
  hosts: HOSTS,
  avian_hosts: AVIAN_HOSTS,
  min_segemnt_length: MIN_SEGMENT_LENGTH
};

module.exports = ALLOWED_VALUES;
