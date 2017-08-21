const game = {
  name: 'le Sim Game',
  version: '0.0.1',
  updateGranularity: 0.25,
  maxUpdateCycles: 3600,
  tabs: [{
      title: 'Gold & stuff',
      items: [{
          title: 'Gold',
          primary: 'Gold',
          items: [{
              items: ['Gold']
            },
            {
              items: ['Gold Mine', 'Max Gold Mines']
            },
            {
              primary: 'Gold Prospector'
            },
          ]
        },
        {
          title: 'Empty Group',
          items: [],
          description: "There's nothing here."
        },
        {
          title: 'Fecal Matter',
          items: [{
            primary: 'Poop'
          }]
        },
      ]
    },
    {
      title: 'Remix',
      primary: 'Poop',
      items: [{
          title: 'Feces',
          primary: 'Poop',
          items: []
        },
        {
          title: 'Not Feces',
          primary: 'Gold Mine',
          items: [{
            primary: 'Gold Mine'
          }],
          description: "ok so there isn't anything interesting here."
        },
      ],
      description: 'This is a small remix of some of the other stuff you already saw in the other tab'
    },
    {
      title: 'Surprise third tab!',
      primary: 'Gold Prospector'
    },
    {
      title: 'About',
      items: [],
      right: true,
      description: "This is a simulator game that I made from boredom.\
            <p>There isn't really all that much here yet, but I'm actively working on it.</p>\
            <p>Developerd by <a href='https://github.com/lepouya'>Pouya Larjani</a></p>",
    },
  ],
  growths: {
    '+100%': {
      growthFunction: 'percentage',
      coefficient: 100,
      tier: 0,
    },
    '*1.1': {
      growthFunction: 'multiplicative',
      coefficient: 1.1,
      tier: 0,
    },
    '*2': {
      growthFunction: 'multiplicative',
      coefficient: 2,
      tier: 0,
    },
    '-40%': {
      growthFunction: 'percentage',
      coefficient: -40,
      tier: 1,
    },
  },
  resources: {
    Gold: {
      description: "This is your good old boring gold. Basic unit for spending etc etc",
      locked: false,
      count: 10000,
      price: [],
    },
    'Gold Mine': {
      description: "This is an entire fucking gold mine that could be yours",
      locked: false,
      count: 1,
      price: [{
        entity: 'Gold',
        baseRate: 5
      }],
      sellModifier: ['-40%'],
      purchaseGrowth: ['+100%'],
      outputRate: [{
        entity: 'Gold',
        baseRate: 1
      }],
    },
    'Max Gold Mines': {
      description: "Increases the maximum number of gold mines you can have",
      visible: false,
      locked: false,
      requirement: [{
        entity: 'Gold Mine',
        baseRate: 5
      }],
      price: [{
        entity: 'Gold',
        baseRate: 100
      }],
      purchaseGrowth: ['*2'],
      setsLimitFor: [{
        entity: 'Gold Mine',
        bonuses: [{
            growthFunction: 'exponential',
            coefficient: 2
          },
          {
            growthFunction: 'multiplicative',
            coefficient: 5
          },
        ]
      }],
    },
    'Gold Prospector': {
      description: "Finds gold mines for you. Kinda fucking weird if you think about it",
      visible: false,
      requirement: [{
        entity: 'Gold Mine',
        baseRate: 35
      }],
      price: [{
          entity: 'Gold',
          baseRate: 1000
        },
        {
          entity: 'Gold Mine',
          baseRate: 10
        }
      ],
      sellModifier: ['-40%'],
      purchaseGrowth: ['*1.1'],
      inputRate: [{
        entity: 'Gold',
        baseRate: 50
      }],
      outputRate: [{
        entity: 'Gold Mine',
        baseRate: 1
      }],
    },
    Poop: {
      description: "This is literally <i>shit</i>",
      locked: false,
      price: [{
        entity: 'Gold',
        baseRate: 10
      }],
      purchaseGrowth: ['*2'],
      inputRate: [{
        entity: 'Gold',
        baseRate: 5
      }],
    },
  },
};

export default game;