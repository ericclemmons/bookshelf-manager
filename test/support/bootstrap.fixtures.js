var Promise = require('bluebird');

module.exports = function(manager) {

  var make      = manager.forge('make',    { name: 'BMW' });
  var model     = manager.forge('model',   { name: 'X5', cost: '50000.00' });
  var type      = manager.forge('type',    { name: 'Crossover' });
  var specs     = manager.forge('specs',   [ { name: '4 door' }, { name: 'v6' } ]);
  var color     = manager.forge('color',   { name: 'Grey', hex_value: '#666' });
  var dealer    = manager.forge('dealer',  { name: 'Houston', zip_code: '77002' });
  var features  = manager.forge('features', [ { name: 'GPS', cost: '500' }, { name: 'ABS', cost: '1250' }]);
  var car       = manager.forge('car');

  return make.save()
    .then(function() {
      return type.save();
    })
    .then(function() {
      return Promise.all(specs.invoke('save'));
    })
    .then(function() {
      return color.save();
    })
    .then(function() {
      model.set('make_id', make.get('id'));
      model.set('type_id', type.get('id'));

      return model.save();
    })
    .then(function() {
      return model.specs().attach(specs.toArray());
    })
    .then(function() {
      return Promise.all(features.invoke('save'));
    })
    .then(function() {
      return dealer
        .set('make_id', make.get('id'))
        .save()
      ;
    })
    .then(function() {
      car.set('color_id',   color.get('id'));
      car.set('dealer_id',  dealer.get('id'));
      car.set('model_id',   model.get('id'));
      car.set('quantity',   1);

      return car.save();
    })
    .then(function() {
      return car.features().attach(features.toArray());
    })
  ;
};
