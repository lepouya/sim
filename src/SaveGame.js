import ResourceManager from "./model/ResourceManager";

export default new ResourceManager().load({
  name: 'le Sim Game',
  updateGranularity: 0.25,
  maxUpdateCycles: 3600,
  tabs: [
    {
      title: 'Gold',
      primary: 'Gold',
      items: [
        {items: ['Gold']},
        {items: ['Gold Mine', 'Max Gold Mines']},
        {primary: 'Gold Prospector'},
    ]},
    {title: 'Empty Group', items: []},
    {title: 'Fecal Matter', items: [{primary: 'Poop'}]},
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
      price: [{entity: 'Gold', baseRate: 5}],
      sellModifier: ['-40%'],
      purchaseGrowth: ['+100%'],
      outputRate: [{entity: 'Gold', baseRate: 1}],
    },
    'Max Gold Mines': {
      description: "Increases the maximum number of gold mines you can have",
      visible: false,
      locked: false,
      requirement: [{entity: 'Gold Mine', baseRate: 5}],
      price: [{entity: 'Gold', baseRate: 100}],
      purchaseGrowth: ['*2'],
      setsLimitFor : [
        {entity: 'Gold Mine',
         bonuses: [
          {growthFunction: 'exponential', coefficient: 2},
          {growthFunction: 'multiplicative', coefficient: 5},
      ]}],
    },
    'Gold Prospector': {
      description: "Finds gold mines for you. Kinda fucking weird if you think about it",
      visible: false,
      requirement: [{entity: 'Gold Mine', baseRate: 35}],
      price: [
        {entity: 'Gold', baseRate: 1000},
        {entity: 'Gold Mine', baseRate: 10}],
      sellModifier: ['-40%'],
      purchaseGrowth: ['*1.1'],
      inputRate: [{entity: 'Gold', baseRate: 50}],
      outputRate: [{entity: 'Gold Mine', baseRate: 1}],
    },
    Poop: {
      description: "This is literally shit",
      locked: false,
      price: [{entity: 'Gold', baseRate: 10}],
      purchaseGrowth: ['*2'],
      inputRate: [{entity: 'Gold', baseRate: 5}],
    },
  },
});