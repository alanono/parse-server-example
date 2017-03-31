Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world2!");
});
 Parse.Cloud.define("test", function(request, response) {
   var Query = Parse.Object.extend("_User");
   var query = new Parse.Query(Query);   query.equalTo("objectId", request.params.objectId);
   query.first({ useMasterKey: true }).then(function(object) {
        response.success(object);
      }, function(error) {
        response.error(error);
      });
});

Parse.Cloud.define("updateUserPass", function(request, response) {
  Parse.Cloud.useMasterKey();
  var query = Parse.Object.extend("_User")
  console.log(request.params);
  query.equalTo("objectId", request.params.objectId);
  query.find({
    success: function(results) {
	  console.log(results);
	  if(results.length == 1){
		  var obj = results[0];
		  obj.set("username", request.params.username);
		  obj.set("password", request.params.password);
		  obj.save();
	  }
      response.success("Atualizado com sucesso");
    },
    error: function() {
		console.log('erro query');
      response.error("meu Erro");
    }
  });
});
/*
Parse.Cloud.define("corrigirApiario", function(request, response) {
	//var Apiario = Parse.Object.extend("Apiario");
	console.log("aqui ");
	var query = new Parse.Query("Apiario");
	console.log("aqui 2");
	query.find({
		success: function(results) {
		  for (var i = 0; i < results.length; ++i) {
			console.log("i " + i);
			var apicultor = results[i].get("apicultor");
			console.log("ap " + apicultor);
			results[i].set("associacao", apicultor.get("associacao"));
		  }
		  response.success("deu certo ?!");
		},
		error: function() {
		  response.error(" failed");
		}
	});
	console.log("aqui 3");
  
});

Parse.Cloud.beforeSave("Associacao", function(request, response) {
	
  if (request.object.get("numeroSif") != undefined) {
	var numeroSif  =  request.object.get("numeroSif");
	var objectId = request.object.id;
	
	
	var Associacao = Parse.Object.extend("Associacao");
	var query = new Parse.Query(Associacao);
	query.get(objectId, {
	  success: function(associacao) {
		var numeroSifNovo = associacao.get('numeroSif')
		console.log('objectId = '+objectId);
		console.log('object = '+associacao);
		console.log('numero sif antigo = '+numeroSif);
		console.log('numero sif novo = '+numeroSifNovo);
		if(numeroSifNovo != numeroSif){
			request.object.set("tipoRegistro",1);
			request.object.set("registro",numeroSif);
		}
		response.success();
	  },
	  error: function(object, error) {
		response.error("Objeto nao encontrado");
	  }
	});
  }
});

//http://stackoverflow.com/questions/32914945/how-to-query-objects-in-the-cloudcode-beforesave
Parse.Cloud.beforeSave("Apiario", function(request, response) {
  var apiario = request.object;
  var storeJSON = apiario.toJSON();
  console.log("apiario ID " + apiario.id + "qtdCaixas" + apiario.get("qtdCaixas"));
  
  if(apiario.id){
	  var ApiarioClass = Parse.Object.extend("Apiario");
	  var apiarioOld = new ApiarioClass();
	  
	  apiarioOld.set("objectId", apiario.id);
	  apiarioOld.fetch({
		success: function(apiarioOld) {
			console.log("apiario ID " + apiario.id + "qtdCaixasApiario" + apiario.get("qtdCaixas"));
			var historicoApiario = new Parse.Object("HistoricoApiario");

			historicoApiario.set("apiario", apiarioOld);
			historicoApiario.set("location", apiarioOld.get("location"));
			historicoApiario.set("migratorio", apiarioOld.get("migratorio"));
			historicoApiario.set("qtdCaixas", apiarioOld.get("qtdCaixas"));
			console.log(apiarioOld.get("qtdCaixas")+"qtdCaixasOld");
			historicoApiario.set("dialogoVizinhos", apiarioOld.get("dialogoVizinhos"));
			historicoApiario.set("existenciaMortalidadeAbelha", apiarioOld.get("existenciaMortalidadeAbelha"));
			historicoApiario.set("exameColmeiaDoenca", apiarioOld.get("exameColmeiaDoenca"));
			historicoApiario.set("historicoMortandade", apiarioOld.get("historicoMortandade"));
			historicoApiario.set("observacao", apiarioOld.get("observacao"));
			historicoApiario.set("apicultor", apiarioOld.get("apicultor"));
			historicoApiario.set("propriedade", apiarioOld.get("propriedade"));
			historicoApiario.set("especieAbelha", apiarioOld.get("especieAbelha"));
			historicoApiario.set("motivoMortandade", apiarioOld.get("motivoMortandade"));
			historicoApiario.set("motivoHistoricoMortandade", apiarioOld.get("motivoHistoricoMortandade"));
			historicoApiario.set("atividadeApicula", apiarioOld.get("atividadeApicula"));
			historicoApiario.set("culturas", apiarioOld.get("culturas"));
			historicoApiario.set("producoes", apiarioOld.get("producoes"));
			historicoApiario.set("elevacao", apiarioOld.get("elevacao"));
			historicoApiario.set("caminhoImagem", apiarioOld.get("caminhoImagem"));
			historicoApiario.set("ativo", apiarioOld.get("ativo"));
			historicoApiario.set("nomesArquivos", apiarioOld.get("nomesArquivos"));
			historicoApiario.set("uuid", apiarioOld.get("uuid"));

			historicoApiario.save();

			console.log(storeJSON+" ");
			// Recreating Apiario
            for ( key in storeJSON ) {
                apiario.set( key, storeJSON[key]);
            }			
			
			console.log("apiario ID " + apiario.id + "qtdCaixasApiario" + apiario.get("qtdCaixas"));
			response.success();
		},
		error: function(apiarioOld, error) {
		  response.error("Got an error " + error.code + " : " + error.message);
		}
	  });
  }
  else{
	  console.log("Novo apiario");
	  response.success();
  }
});  */