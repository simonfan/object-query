(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'.././src' :
		// browser
		'object-query',
		// dependencies for the test
		deps = [mod, 'should'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(objectQuery, should) {
	'use strict';

	describe('query = objectQuery(criteria {Object})', function () {

		it('is a function', function () {
			var query = objectQuery();

			query.should.be.type('function');
		});



		beforeEach(function () {
			var locations = this.locations = [];

			var brasil,
				sp, mg,
				saopaulo, campinas, belohorizonte, ouropreto,
				saude, butanta, belavista, savassi;

			brasil = this.brasil = {
				name: 'Brasil',
				type: 'country',
				population: 201032714,
			};

			// states
			sp = this.sp = {
				name: 'Sao Paulo',
				type: 'state',
				country: brasil,
				population: 41901219,
				dishes: ['virado', 'cafe']
			};

			mg = this.mg = {
				name: 'Minas Gerais',
				type: 'state',
				country: brasil,
				population: 19855332,
				dishes: ['tutu', 'feijao tropeiro', 'feijoada', 'queijo']
			};



			// districts
			saude = this.saude = {
				name: 'Saude',
				type: 'district',
			};

			butanta = this.butanta = {
				name: 'Butanta',
				type: 'district',
			};

			belavista = this.belavista = {
				name: 'Bela Vista',
				type: 'district',
			};

			savassi = this.savassi = {
				name: 'Savassi',
				type: 'district'
			};


			// cities
			saopaulo = this.saopaulo = {
				name: 'Sao Paulo',
				type: 'city',
				state: sp,
				population: 11316149,
				districts: [saude, butanta, belavista]
			};


			campinas = this.campinas = {
				name: 'Campinas',
				type: 'city',
				state: sp,
				population: 1098630
			};

			belohorizonte = this.belohorizonte = {
				name: 'Belo Horizonte',
				type: 'city',
				state: mg,
				population: 2479175,
				districts: [savassi]
			};

			ouropreto = this.ouropreto = {
				name: 'Ouro Preto',
				type: 'city',
				state: mg,
				population: 70227
			}

			locations.push(brasil);

			locations.push(mg);
			locations.push(belohorizonte);
			locations.push(ouropreto);

			locations.push(sp);
			locations.push(saopaulo);
			locations.push(campinas);


		});

		describe('basic query', function () {
			it('identical', function () {
				var stateMatcher = objectQuery({
					type: 'state',
				});

				stateMatcher(this.sp).should.be.true;
				stateMatcher(this.brasil).should.be.false;
			});

			it('match against array property', function () {
				var tutu = objectQuery({
					dishes: 'tutu'
				});

				tutu(this.sp).should.be.false;
				tutu(this.mg).should.be.true;
			});

			it('throws error when operators are not correctly defined', function () {
				var wrong = objectQuery({
					dishes: ['tutu', 'feijao tropeiro']
				});

				try {
					wrong(this.sp);
				} catch (e) {
					e.should.be.ok;
				}
			})
		});

		describe('deep query', function () {
			it('identical match', function () {
				var fromSPstate = objectQuery({
					'state.name': 'Sao Paulo'
				});

				fromSPstate(this.saopaulo)
					.should.be.true;

				fromSPstate(this.belohorizonte)
					.should.be.false;
			});

			it('returns false if property does not exitst', function () {
				var fromMGstate = objectQuery({
					'state.name': 'Minas Gerais'
				});

				fromMGstate(this.belohorizonte)
					.should.be.true;

				fromMGstate({
					name: 'state-less'
				}).should.be.false;

			});
		});

		describe('range query', function () {

			it('greaterThan = objectQuery({ prop: { $gt: limit } })', function () {

				var populationGreaterThan10Million = objectQuery({ population: { $gt: 10000000 }});

				populationGreaterThan10Million(this.saopaulo).should.be.true;

				populationGreaterThan10Million(this.ouropreto).should.be.false;

			});

			it('aggregate = objectQuery({ prop1: { $gt: bottomLimit }, prop2: { $lt: topLimit } })', function () {
				var populationBetween1mAnd5m = objectQuery({
					population: { $gt: 1000000, $lt: 5000000 }
				});

				populationBetween1mAnd5m(this.saopaulo)
					.should.be.false;

				populationBetween1mAnd5m(this.belohorizonte)
					.should.be.true;

				populationBetween1mAnd5m(this.ouropreto)
					.should.be.false;
			});

		});


		describe('set query', function () {
			describe('$in = objectQuery({ prop: { $in: [\'eitherThis\', \'or\', \'that\'] }})', function () {

				it('matches basics', function () {
					var viradoOuMoqueca = objectQuery({
						dishes: {
							$in: ['moqueca', 'virado']
						}
					});

					viradoOuMoqueca({ dishes: ['moqueca'] }).should.be.true;
					viradoOuMoqueca(this.sp).should.be.true;
					viradoOuMoqueca(this.mg).should.be.false;
				});

				it('matches deep', function () {
					var savassiOrSaude = objectQuery({
						'districts.name': {
							$in: ['Saude', 'Savassi']
						}
					});

					savassiOrSaude({
						districts: [
							{ name: 'Saude' }
						]
					}).should.be.true;

					savassiOrSaude(this.belohorizonte)
						.should.be.true;

					savassiOrSaude(this.saopaulo)
						.should.be.true;

					savassiOrSaude(this.ouropreto)
						.should.be.false;
				});
			});

			describe('$nin = objectQuery({ prop: { $nin: [] }})', function () {
				it('basics', function () {
					var notTutuNorVirado = objectQuery({
						dishes: {
							$nin: ['tutu', 'virado']
						}
					});

					notTutuNorVirado(this.sp)
						.should.be.false;

					notTutuNorVirado(this.mg)
						.should.be.false;

					notTutuNorVirado({
						dishes: ['lalala', 'balalala']
					}).should.be.true;
				})
			});

			describe('$all', function () {
				it('basics', function () {
					var tutuAndVirado = objectQuery({
						dishes: {
							$all: ['tutu', 'virado']
						}
					});

					tutuAndVirado(this.sp)
						.should.be.false;

					tutuAndVirado(this.mg)
						.should.be.false;

					var tutuAndQueijo = objectQuery({
						dishes: {
							$all: ['tutu', 'queijo']
						}
					});

					tutuAndQueijo(this.sp)
						.should.be.false;

					tutuAndQueijo(this.mg)
						.should.be.true;
				})
			})
		});

	});
});
