var APP_DATA = {
  "scenes": [
    {
      "id": "0-front-entrance",
      "name": "Front Entrance",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.8466619955285708,
          "pitch": 0.13422541738170324,
          "rotation": 5.497787143782138,
          "target": "1-carport"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-carport",
      "name": "Carport",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -2.8170991126763827,
          "pitch": 0.12898978911039904,
          "rotation": 0,
          "target": "0-front-entrance"
        },
        {
          "yaw": -1.3281277865364842,
          "pitch": 0.22630965921403678,
          "rotation": 0,
          "target": "2-house-exterior"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-house-exterior",
      "name": "House Exterior",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.9305241851125317,
          "pitch": 0.02452392596718056,
          "rotation": 0.7853981633974483,
          "target": "3-bedroom-1"
        },
        {
          "yaw": -1.404480118169655,
          "pitch": 0.07813795983707905,
          "rotation": 0,
          "target": "5-dining-area"
        },
        {
          "yaw": -1.611488067754923,
          "pitch": -0.002534447501961523,
          "rotation": 0,
          "target": "11-living-area"
        },
        {
          "yaw": -1.9250651497267484,
          "pitch": -0.016067996512283855,
          "rotation": 0,
          "target": "12-kitchen"
        },
        {
          "yaw": -1.213070654531169,
          "pitch": 0.016593224438407717,
          "rotation": 0.7853981633974483,
          "target": "6-bedroom-2"
        },
        {
          "yaw": 0.6158855024508547,
          "pitch": 0.005584199495423547,
          "rotation": 0,
          "target": "0-front-entrance"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-bedroom-1",
      "name": "Bedroom 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -1.444980141395929,
          "pitch": 0.18832919108917956,
          "rotation": 0,
          "target": "2-house-exterior"
        },
        {
          "yaw": -0.7165435697345988,
          "pitch": 0.13457845829488413,
          "rotation": 0.7853981633974483,
          "target": "5-dining-area"
        },
        {
          "yaw": 2.036272913725357,
          "pitch": 0.17869979462225594,
          "rotation": 4.71238898038469,
          "target": "4-bedroom-1-bathroom"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "4-bedroom-1-bathroom",
      "name": "Bedroom 1 Bathroom",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.5253346638823917,
          "pitch": 0.16378824794876579,
          "rotation": 0,
          "target": "3-bedroom-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "5-dining-area",
      "name": "Dining Area",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.325007861718504,
          "pitch": 0.14508211826300688,
          "rotation": 0,
          "target": "2-house-exterior"
        },
        {
          "yaw": 0.693545787914136,
          "pitch": 0.06491880532631455,
          "rotation": 10.995574287564278,
          "target": "1-carport"
        },
        {
          "yaw": 0.36768460535721914,
          "pitch": 0.09328891696565833,
          "rotation": 5.497787143782138,
          "target": "3-bedroom-1"
        },
        {
          "yaw": -0.600546349078968,
          "pitch": 0.15176950973765635,
          "rotation": 0,
          "target": "6-bedroom-2"
        },
        {
          "yaw": -1.3691621743484905,
          "pitch": 0.21554308382528475,
          "rotation": 0,
          "target": "11-living-area"
        },
        {
          "yaw": -3.0180975098060294,
          "pitch": 0.028789957307729708,
          "rotation": 7.0685834705770345,
          "target": "12-kitchen"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "6-bedroom-2",
      "name": "Bedroom 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.32691972855018925,
          "pitch": 0.1839015801648376,
          "rotation": 0,
          "target": "5-dining-area"
        },
        {
          "yaw": 0.4438382988687586,
          "pitch": 0.2394660576678227,
          "rotation": 7.0685834705770345,
          "target": "8-hallway"
        },
        {
          "yaw": 2.6302648078671425,
          "pitch": 0.19940205425426072,
          "rotation": 0,
          "target": "7-bedroom-2-bathroom"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "7-bedroom-2-bathroom",
      "name": "Bedroom 2 Bathroom",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.761024367242614,
          "pitch": 0.28201856982803974,
          "rotation": 10.995574287564278,
          "target": "6-bedroom-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "8-hallway",
      "name": "Hallway",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.011070442093913613,
          "pitch": 0.3605764897311481,
          "rotation": 0,
          "target": "6-bedroom-2"
        },
        {
          "yaw": -1.31433049584599,
          "pitch": 0.33734147065010767,
          "rotation": 0,
          "target": "9-bedroom-3"
        },
        {
          "yaw": -2.1941015967853694,
          "pitch": 0.43928134380315953,
          "rotation": 5.497787143782138,
          "target": "10-common-bathroom"
        },
        {
          "yaw": 2.1226488452241643,
          "pitch": 0.27332080541606274,
          "rotation": 0,
          "target": "11-living-area"
        },
        {
          "yaw": 1.785438224343367,
          "pitch": 0.026211992684848084,
          "rotation": 0,
          "target": "12-kitchen"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "9-bedroom-3",
      "name": "Bedroom 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.7251501466359791,
          "pitch": 0.2076537196574595,
          "rotation": 7.0685834705770345,
          "target": "8-hallway"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "10-common-bathroom",
      "name": "Common Bathroom",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.1304895999965687,
          "pitch": 0.22076317814016377,
          "rotation": 0,
          "target": "8-hallway"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "11-living-area",
      "name": "Living Area",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -1.0959174926759179,
          "pitch": 0.1615199202851869,
          "rotation": 0,
          "target": "8-hallway"
        },
        {
          "yaw": -0.1425938860643221,
          "pitch": 0.23731526041978235,
          "rotation": 0,
          "target": "5-dining-area"
        },
        {
          "yaw": 1.4140481840445158,
          "pitch": 0.14906277962949943,
          "rotation": 0,
          "target": "12-kitchen"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "12-kitchen",
      "name": "Kitchen",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        },
        {
          "tileSize": 512,
          "size": 4096
        }
      ],
      "faceSize": 3880,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -2.0625947301958867,
          "pitch": 0.14396486927122432,
          "rotation": 0,
          "target": "5-dining-area"
        },
        {
          "yaw": 2.81873337600474,
          "pitch": 0.24859495266965048,
          "rotation": 0,
          "target": "11-living-area"
        }
      ],
      "infoHotspots": [
        {
          "yaw": 1.2929857671280214,
          "pitch": 0.20422626136307898,
          "title": "Housekeeping Storage Room",
          "text": "A dedicated storage area for housekeeping supplies. This room is not included in the virtual tour."
        }
      ]
    }
  ],
  "name": "Project Title",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": true,
    "viewControlButtons": false
  }
};
