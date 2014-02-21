var ContactMaterial =   require(__dirname + '/../../src/material/ContactMaterial')
,   Material =          require(__dirname + '/../../src/material/Material')

exports.construct = function(test){
    var m1 = new Material(),
        m2 = new Material();
    new ContactMaterial(m1,m2);

    test.throws(function(){
        new ContactMaterial();
    },'Should throw error if not passed materials');

    test.notEqual(  new ContactMaterial(m1,m2).id,
                    new ContactMaterial(m1,m2).id,
                    'Should get new ids');

    test.done();
};

