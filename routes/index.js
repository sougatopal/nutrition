var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
client = new Client();
var html_dir = './html/';

/* GET home page. */
router.get('/', function(req, res) {
	res.sendfile(html_dir + 'index.html');
});

/*router.get('/', function(req, res) {
  res.render('index', {title : "EAT BETTER LIVE BETTER"});
});
*/
router.get('/getrecipes/:key/:p/:cnt', function (req, res){  
	var resFilterData = {};
	var args = {
	  path:{"key":req.params.key, "p":req.params.p, "cnt":req.params.cnt},
	  headers:{"Content-Type": "application/json"} 
	};
	
	// registering remote methods
	client.registerMethod("jsonMethod", "http://api.bigoven.com/recipes?title_kw=${key}&pg=${p}&rpp=${cnt}&api_key=dvx6sUuiVA6sl787123zwOByxH5i075k", "GET");

	client.methods.jsonMethod(args,function(data,response){
		// parsed response body as js object
		var resData = JSON.parse(data);
		resFilterData['searchTerm'] = req.params.key;
		resFilterData['pg'] = req.params.p;
		resFilterData['rpp'] = req.params.cnt;
		resFilterData['resultCount'] = resData.ResultCount;
		resFilterData['results'] = [];
		
		for(var i=0; i<resData.Results.length; i++) {	
			var result = {};
			result['RecipeID'] = resData.Results[i].RecipeID;
			result['Title'] = resData.Results[i].Title;
			result['Cuisine'] = resData.Results[i].Cuisine;
			result['Category'] = resData.Results[i].Category;
			result['Subcategory'] = resData.Results[i].Subcategory;
			result['ImageURL120'] = resData.Results[i].ImageURL120;
			result['StarRating'] = resData.Results[i].StarRating;
			result['StarRatingIMG'] = resData.Results[i].StarRatingIMG;
			resFilterData.results[i] = result;
			//console.log(resFilterData.results[i].Title);
		}
		//res.send(resFilterData);
		res.json(resFilterData);
		//console.log(resFilterData);
		//res.render('home', resFilterData);		
	});  
});


router.get('/getrecipe/:id', function (req, res){  
	var resFilterData = {};
	var args = {
	  path:{"id":req.params.id},
	  headers:{"Content-Type": "application/json"} 
	};
	
	// registering remote methods
	client.registerMethod("jsonMethod", "http://api.bigoven.com/recipe/${id}?api_key=dvx6sUuiVA6sl787123zwOByxH5i075k", "GET");

	client.methods.jsonMethod(args,function(data,response){
		// parsed response body as js object
		var resData = JSON.parse(data);
		
		resFilterData['RecipeID'] = resData.RecipeID;
		resFilterData['Title'] = resData.Title;
		resFilterData['Description'] = resData.Description;
		resFilterData['Cuisine'] = resData.Cuisine;
		resFilterData['Category'] = resData.Category;
		resFilterData['Subcategory'] = resData.Subcategory;
		resFilterData['StarRating'] = resData.StarRating;
		resFilterData['ImageURL'] = resData.ImageURL;
		
		resFilterData['Ingredients'] = [];
		
		for(var i=0; i<resData.Ingredients.length; i++) {	
			var ingredient = {};
			ingredient['IngredientID'] = resData.Ingredients[i].IngredientID;
			ingredient['Name'] = resData.Ingredients[i].Name;
			ingredient['Quantity'] = resData.Ingredients[i].Quantity;
			ingredient['Unit'] = resData.Ingredients[i].Unit;
			ingredient['MetricQuantity'] = resData.Ingredients[i].MetricQuantity;
			ingredient['MetricUnit'] = resData.Ingredients[i].MetricUnit;
			ingredient['PreparationNotes'] = resData.Ingredients[i].PreparationNotes;			
			resFilterData.Ingredients[i] = ingredient;
			//console.log(resFilterData.Ingredients[i].Name);
		}		
		resFilterData['Instructions'] = resData.Instructions;
		// console.log(resFilterData);
		//res.render('home', resFilterData);		
		res.json(resFilterData);
	});  
});

router.post('/getnutrition', function (req, res) {
	var resFilterData = {};
	var args = {
	  data: req.body,
	  headers:{"Content-Type": "application/json"} 
	};
	
	client.registerMethod("postMethod", "http://api.edamam.com/api/nutrient-info?extractOnly&app_id=68560d7c&app_key=cb12dffd21601807e59acb82cf20a609", "POST");

	client.methods.postMethod(args, function(data,response){	
		
		resFilterData['yield'] = data.yield;
		resFilterData['calories'] = data.calories;
		resFilterData['dietLabels'] = [];
		resFilterData['healthLabels'] = [];
		resFilterData['cautions'] = data.cautions;
		
		for(var i=0; i<data.dietLabels.length; i++){
			resFilterData.dietLabels[i] = dietProp[data.dietLabels[i]];
		}
		
		for(var i=0; i<data.healthLabels.length; i++){
			resFilterData.healthLabels[i] = healthProp[data.healthLabels[i]];
		}
		
		resFilterData['totalNutrients'] = [];

		var totalNutrients = data.totalNutrients,
			eachNutrient = {};

		for (var key in totalNutrients) {
			eachNutrient = {
				name : key,
				label : totalNutrients[key]["label"],
				quantity : totalNutrients[key]["quantity"],
				unit : totalNutrients[key]["unit"],
			}
			resFilterData.totalNutrients.push(eachNutrient);
		}

		resFilterData['totalDaily'] = [];

		var totalDaily = data.totalDaily,
			eachDaily = {};

		for (var key in totalDaily) {
			eachDaily = {
				name : key,
				label : totalDaily[key]["label"],
				quantity : totalDaily[key]["quantity"],
				unit : totalDaily[key]["unit"],
			}
			resFilterData.totalDaily.push(eachDaily);
		}

		res.json(resFilterData);	
		
/*		if(data.totalNutrients.ENERC_KCAL != undefined){
			var nutrient = {};
			nutrient['name'] = "ENERC_KCAL";
			nutrient['label'] = data.totalNutrients.ENERC_KCAL.label;
			nutrient['quantity'] = data.totalNutrients.ENERC_KCAL.quantity;
			nutrient['unit'] = data.totalNutrients.ENERC_KCAL.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.FAT != undefined){
			var nutrient = {};
			nutrient['name'] = "FAT";
			nutrient['label'] = data.totalNutrients.FAT.label;
			nutrient['quantity'] = data.totalNutrients.FAT.quantity;
			nutrient['unit'] = data.totalNutrients.FAT.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.FASAT != undefined){
			var nutrient = {};
			nutrient['name'] = "FASAT";
			nutrient['label'] = data.totalNutrients.FASAT.label;
			nutrient['quantity'] = data.totalNutrients.FASAT.quantity;
			nutrient['unit'] = data.totalNutrients.FASAT.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.FATRN != undefined){
			var nutrient = {};
			nutrient['name'] = "FATRN";
			nutrient['label'] = data.totalNutrients.FATRN.label;
			nutrient['quantity'] = data.totalNutrients.FATRN.quantity;
			nutrient['unit'] = data.totalNutrients.FATRN.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.CHOCDF != undefined){
			var nutrient = {};
			nutrient['name'] = "CHOCDF";
			nutrient['label'] = data.totalNutrients.CHOCDF.label;
			nutrient['quantity'] = data.totalNutrients.CHOCDF.quantity;
			nutrient['unit'] = data.totalNutrients.CHOCDF.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.FIBTG != undefined){
			var nutrient = {};
			nutrient['name'] = "FIBTG";
			nutrient['label'] = data.totalNutrients.FIBTG.label;
			nutrient['quantity'] = data.totalNutrients.FIBTG.quantity;
			nutrient['unit'] = data.totalNutrients.FIBTG.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.SUGAR != undefined){
			var nutrient = {};
			nutrient['name'] = "SUGAR";
			nutrient['label'] = data.totalNutrients.SUGAR.label;
			nutrient['quantity'] = data.totalNutrients.SUGAR.quantity;
			nutrient['unit'] = data.totalNutrients.SUGAR.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.FASAT != undefined){
			var nutrient = {};
			nutrient['name'] = "PROCNT";
			nutrient['label'] = data.totalNutrients.PROCNT.label;
			nutrient['quantity'] = data.totalNutrients.PROCNT.quantity;
			nutrient['unit'] = data.totalNutrients.PROCNT.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.CHOLE != undefined){
			var nutrient = {};
			nutrient['name'] = "CHOLE";
			nutrient['label'] = data.totalNutrients.CHOLE.label;
			nutrient['quantity'] = data.totalNutrients.CHOLE.quantity;
			nutrient['unit'] = data.totalNutrients.CHOLE.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
		if(data.totalNutrients.NA != undefined){
			var nutrient = {};
			nutrient['name'] = "NA";
			nutrient['label'] = data.totalNutrients.NA.label;
			nutrient['quantity'] = data.totalNutrients.NA.quantity;
			nutrient['unit'] = data.totalNutrients.NA.unit;			
			resFilterData.totalNutrients[i++] = nutrient;			
		}
			*/
		
		
/*		var j = 0;
		
		if(data.totalDaily.ENERC_KCAL != undefined){
			var dly = {};
			dly['name'] = "ENERC_KCAL";
			dly['label'] = data.totalDaily.ENERC_KCAL.label;
			dly['quantity'] = data.totalDaily.ENERC_KCAL.quantity;
			dly['unit'] = data.totalDaily.ENERC_KCAL.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.FAT != undefined){
			var dly = {};
			dly['name'] = "FAT";
			dly['label'] = data.totalDaily.FAT.label;
			dly['quantity'] = data.totalDaily.FAT.quantity;
			dly['unit'] = data.totalDaily.FAT.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.FASAT != undefined){
			var dly = {};
			dly['name'] = "FASAT";
			dly['label'] = data.totalDaily.FASAT.label;
			dly['quantity'] = data.totalDaily.FASAT.quantity;
			dly['unit'] = data.totalDaily.FASAT.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.FATRN != undefined){
			var dly = {};
			dly['name'] = "FATRN";
			dly['label'] = data.totalDaily.FATRN.label;
			dly['quantity'] = data.totalDaily.FATRN.quantity;
			dly['unit'] = data.totalDaily.FATRN.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.CHOCDF != undefined){
			var dly = {};
			dly['name'] = "CHOCDF";
			dly['label'] = data.totalDaily.CHOCDF.label;
			dly['quantity'] = data.totalDaily.CHOCDF.quantity;
			dly['unit'] = data.totalDaily.CHOCDF.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.FIBTG != undefined){
			var dly = {};
			dly['name'] = "FIBTG";
			dly['label'] = data.totalDaily.FIBTG.label;
			dly['quantity'] = data.totalDaily.FIBTG.quantity;
			dly['unit'] = data.totalDaily.FIBTG.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.SUGAR != undefined){
			var dly = {};
			dly['name'] = "SUGAR";
			dly['label'] = data.totalDaily.SUGAR.label;
			dly['quantity'] = data.totalDaily.SUGAR.quantity;
			dly['unit'] = data.totalDaily.SUGAR.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.PROCNT != undefined){
			var dly = {};
			dly['name'] = "PROCNT";
			dly['label'] = data.totalDaily.PROCNT.label;
			dly['quantity'] = data.totalDaily.PROCNT.quantity;
			dly['unit'] = data.totalDaily.PROCNT.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.CHOLE != undefined){
			var dly = {};
			dly['name'] = "CHOLE";
			dly['label'] = data.totalDaily.CHOLE.label;
			dly['quantity'] = data.totalDaily.CHOLE.quantity;
			dly['unit'] = data.totalDaily.CHOLE.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		if(data.totalDaily.NA != undefined){
			var dly = {};
			dly['name'] = "NA";
			dly['label'] = data.totalDaily.NA.label;
			dly['quantity'] = data.totalDaily.NA.quantity;
			dly['unit'] = data.totalDaily.NA.unit;			
			resFilterData.totalDaily[j++] = dly;			
		}
		*/
		// parsed response body as js object
		// console.log(resFilterData);
	}); 
	
});

var dietProp = {LOW_CARB : 'Less than 20% of total calories from carbs'
			, HIGH_PROTEIN : 'More than 50% of total calories from proteins'
			, LOW_FAT : 'Less than 15% of total calories from fat'
			, BALANCED : 'Protein/Fat/Carb values in 15/35/50 ratio'
			, HIGH_FIBER : 'More than 5g fiber per serving'
			, LOW_SODIUM : 'Less than 140mg Na per serving'};
			
var healthProp = {DAIRY_FREE : 'No dairy; no lactose'
				, MILK_FREE : 'No milk or milk product'
				, PEANUT_FREE : 'No peanuts or products containing peanuts'
				, TREE_NUT_FREE : 'No tree nuts or products containing tree nuts'
				, SOY_FREE : 'No soy or products containing soy'
				, FISH_FREE : 'No fish or fish derivatives'
				, SHELLFISH_FREE : 'No shellfish or shellfish derivatives'
				, WHEAT_FREE : 'No wheat, can have gluten though'
				, LOW_SUGAR : 'Less than 4g of sugar per serving'
				, VEGAN : 'No meat, poultry, fish, dairy, eggs or honey'
				, PALEO : 'Excludes what are perceived to be agricultural products; grains, legumes, dairy products, potatoes, refined salt, refined sugar, and processed oils'
				, GLUTEN_FREE : 'Free of gluten containing foods'
				, EGG_FREE : 'No eggs or products containing eggs'
				, LOW_FAT_ABS : 'Less than 3g of fat per serving'
				};


// direct way
/*client.get("http://api.bigoven.com/recipes?title_kw=oysters&pg=1&rpp=20&api_key=dvx6sUuiVA6sl787123zwOByxH5i075k", function(data, response){
            // parsed response body as js object
            console.log(data);
            // raw response
            // console.log(response);
        });
*/


module.exports = router;