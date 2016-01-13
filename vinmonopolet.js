Polet = new Mongo.Collection("polet");

var visjsobj;
if (Meteor.isClient) {

    Router.configure({
        layoutTemplate: 'ApplicationLayout'
    });
    // specify the top level route, the page users see when they arrive at the site
    Router.route('/', function() {
        this.render("navbar", {
            to: "header"
        });
        this.render("welcome", {
            to: "main"
        });
    });

    Router.route('/network', function() {
        this.render("navbar", {
            to: "header"
        });
        this.render("network_Visualization", {
            to: "main"
        });
    });

    Router.route('/3d', function() {
        this.render("navbar", {
            to: "header"
        });
        this.render("threeD_Visualization", {
            to: "main"
        });
    });

    Router.route('/2d', function() {
        this.render("navbar", {
            to: "header"
        });
        this.render("twoD_Visualization", {
            to: "main"
        });
    });

    var getChosenAlcoholType = function(chosenAlcoholType) {
        if (chosenAlcoholType === undefined) {
            return undefined;
        } else if (chosenAlcoholType.name === "Beer") {
            chosenAlcoholType = "Øl";
        } else if (chosenAlcoholType.name === "Vodka") {
            chosenAlcoholType = "Vodka";
        } else if (chosenAlcoholType.name === "Gin") {
            chosenAlcoholType = "Gin";
        } else if (chosenAlcoholType.name === "White wine") {
            chosenAlcoholType = undefined;
        } else if (chosenAlcoholType.name === "Portwine") {
            chosenAlcoholType = "Portvin";
        } else if (chosenAlcoholType.name === "All products") {
            chosenAlcoholType = "*";
        }
        return chosenAlcoholType;
    }

    Template.network_viz.events({
        "change .js-select-single-feature": function(event) {
            event.preventDefault();
            var feature = $(event.target).val();
            Session.set("feature", {
                name: feature
            });
        },
        "click .js-show-blobs": function(event) {
            event.preventDefault();
            var chosenAlcoholType = getChosenAlcoholType(Session.get("feature"));
            if (chosenAlcoholType != undefined) {
                initBlobVis(chosenAlcoholType);
            } else {
                initBlobVis("Øl");
            }
        }
    });

    Template.threeD_viz.events({
        "change .js-select-single-feature": function(event) {
            event.preventDefault();
            var feature = $(event.target).val();
            Session.set("feature", {
                name: feature
            });
        },
        "click .js-show-treeD": function(event) {
            event.preventDefault();
            var chosenAlcoholType = getChosenAlcoholType(Session.get("feature"));
            init3DViz(chosenAlcoholType);
        }
    });

    Template.twoD_viz.events({
        "change .js-select-single-feature": function(event) {
            event.preventDefault();
            var feature = $(event.target).val();
            Session.set("feature", {
                name: feature
            });
        },
        "click .js-show-timeline": function(event) {
            event.preventDefault();
            var chosenAlcoholType = getChosenAlcoholType(Session.get("feature"));
            initDateVis(chosenAlcoholType);
        }
    });

    Template.network_viz.helpers({
        "get_feature_names": function() {
            return [{
                name: "Beer"
            }, {
                name: "Vodka"
            }, {
                name: "Gin"
            }];
        }
    });

    Template.threeD_viz.helpers({
        "get_feature_names": function() {
            return [{
                name: "White wine"
            }, {
                name: "Portwine"
            }, {
                name: "All products"
            }];
        }
    });

    Template.twoD_viz.helpers({
        "get_feature_names": function() {
            return [{
                name: "White wine"
            }, {
                name: "Portwine"
            }, {
                name: "All products"
            }];
        }
    });

}

function initDateVis(chosenAlcoholType) {
    // clear out the old visualisation if needed

    var ind = 0;
    var items = new Array();
    var options = {
        style: 'bar',
    };
    // get the div from the DOM that we are going to 
    // put our graph into 
    var container = document.getElementById('visjs');
    container.innerHTML = "";


    var drinks;

    if (chosenAlcoholType === "*") {
        drinks = Polet.find({});
    } else if (chosenAlcoholType === undefined) {
        drinks = Polet.find({
            Varetype: "Hvitvin"
        });
    } else if (chosenAlcoholType !== undefined) {
        drinks = Polet.find({
            Varetype: chosenAlcoholType
        });
    }

    var items = new Array();
    var distributors = {};

    drinks.forEach(function(drink) {
        var distributor = drink.Distributor;
        distributors[distributor] = true;
    });

    drinks.forEach(function(drink) {
        items[ind] = {
            x: ind,
            y: parseFloat(drink.Alkohol),
            // slighlty hacky label -- check out the vis-label
            label: {
                content: drink.Varenavn + " - " + drink.Varetype + " - " + drink.Volum,
                className: 'vis-label',
                xOffset: -5
            }
        };
        ind++;
        //  }
    });
    visjsobj = new vis.Graph2d(container, items, options);
    visjsobj.fit();
}

function initBlobVis(chosenAlcoholType) {

    var drinks = Polet.find({
        Varetype: chosenAlcoholType
    });
    var allDrinks = Polet.find({});

    var items = new Array();
    var distributors = {};
    var alcoholTypes = {};

    drinks.forEach(function(drink) {
        var distributor = drink.Distributor;
        distributors[distributor] = true;
    });

    allDrinks.forEach(function(drink) {
        var alkoholType = drink.Varetype;
        alcoholTypes[alkoholType] = true;
    });

    var nodes = new Array();
    var ind = 0;

    for (distributor in distributors) {
        if (!distributors.hasOwnProperty(distributor)) {
            continue;
        }
        nodes[ind] = {
            id: ind,
            label: distributor,
            value: 0,
            icon: "\uf275",
            distributor: distributor,
            isDistributor: true
        }
        ind++;
    }

    drinks.forEach(function(drink) {
        nodes[ind] = {
            id: ind,
            label: drink.Varenavn + " - " + drink.Volum + "L",
            value: 0,
            icon: "\uf000",
            distributor: drink.Distributor,
            isDistributor: false
        }
        ind++;
    });

    var findDistributorId = function(distributorName) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].distributor === distributorName) {
                return i;
            }
        };
        return -1;
    }
    edges = [];

    nodes.forEach(function(node) {
        if (!node.isDistributor) {
            edges.push({
                from: node.id,
                to: findDistributorId(node.distributor),
                label: ''
            });
        }
    });
    var data = {
        nodes: nodes,
        edges: edges
    };
    // options for the visualisation
    var options = {
        nodes: {
            shape: 'icon',
            iconFontFace: 'FontAwesome',
            iconSize: 50
        }
    };
    // get the div from the dom that we'll put the visualisation into
    container = document.getElementById('visjs');
    // create the visualisation
    visjsobj = new vis.Network(container, data, options);
}

function init3DViz(chosenAlcoholType) {


    var data = new vis.DataSet();
    var counter = 0;
    var drinks;

    if (chosenAlcoholType === "*") {
        drinks = Polet.find({});
    } else if (chosenAlcoholType === undefined) {
        drinks = Polet.find({
            Varetype: "Hvitvin"
        });
    } else if (chosenAlcoholType !== undefined) {
        drinks = Polet.find({
            Varetype: chosenAlcoholType
        });
    }

    var counter = 0;
    drinks.forEach(function(drink) {
        if (drink.Syre === "Ukjent") {
            drink.Syre = "0,0";
        }
        if (drink.Sukker === "Ukjent") {
            drink.Sukker = "0,0";
        }
        var alcohol = parseFloat(drink.Alkohol.replace(",", "."));
        var sugar = parseFloat(drink.Sukker.replace(",", "."));
        var acid = parseFloat(drink.Syre.replace(",", "."));

        data.add({
            id: counter,
            x: alcohol,
            y: sugar,
            z: acid
        });
        counter++;
    });

    // specify options
    var options = {
        width: '100%',
        height: '552px',
        style: 'dot',
        showPerspective: true,
        showGrid: true,
        showShadow: false,
        keepAspectRatio: false,
        verticalRatio: 0.5,
        xLabel: "Alcohol content",
        yLabel: "Sugar content",
        zLabel: "Acidity",
        xBarWidth: 300
    };

    // Instantiate our graph object.
    var container = document.getElementById('visjs');
    visjsobj = new vis.Graph3d(container, data, options);

}