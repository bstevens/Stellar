/* Copyright (C) 2014 Ben Stevens, http://www.benstevens.co.uk */

$(function() {

    var app, 
        TAN30 = Math.tan(Math.PI/6),
        COS30 = Math.cos(Math.PI/6);

    paper.install(window);          
    paper.setup( $('#canvas')[0] );

    function Stellar () {

        this.binary = "0000000000000000";
        this.binaryX = this.binary;

        this.rows = 4;
        this.tilesY = 2;
        this.rH = view.size.height / (this.rows * this.tilesY * 2);
        this.radius = this.rH * 2/3;
        this.tileRadius = (this.rH*this.rows) / COS30;
        this.tileHeight = view.size.height/ this.tilesY;

        this.tileCols = Math.floor((view.size.width)/(this.tileRadius*3/2)); 

        this.tPoints = [];
        this.triangles = [];

        this.loop = 0;
        this.loopMax = 212;

    }

    Stellar.prototype = {

        constructor: Stellar,
        update: function() {

            if(this.loop<this.loopMax) {

                for(var i=0;i<this.triangles.length;i++) {

                    var n = Math.min(90,Math.max(this.loop-(i*2),0));
                    var p = Math.sin(n/180*Math.PI);
                    var o = ( parseInt(this.binaryX[i]) - parseInt(this.binary[i]) ) * p;

                    var s = parseInt(this.binaryX[i]) - o + 0.001;
                    this.triangles[i].scaling = new Point(s,s);

                }
                this.loop+=5;
            }

        },
        start: function() {

            this.flick();

        },
        flick: function() {

            clearTimeout(this.interval);

            this.loop = 0;
            this.updateTriangles();

            view.onFrame = function (event) {

                app.update();

            }

            var demo = this;
            this.interval = setTimeout(function() {
                demo.flick();
            }, 4000);

        },
        plotPoints: function() {

            //firstly count number of points or columns per line
            var _columns = [];

            for(var _ci=0; _ci<this.rows; _ci++) {
                //number of points on this row
                _columns.push((_ci*2)+1);
            }

            for(var _ri=0; _ri<this.rows; _ri++) {

                //plot point
                for(var _pi=0; _pi<_columns[_ri]; _pi++) {

                    var _p = new Point();

                    //relative shift from centre
                    var _sx = _pi-(Math.floor(_columns[_ri]/2));

                    //where _pi is an odd number, shift y
                    var _sy = _ri;	

                    _p.x = _sx * (TAN30*this.rH);
                    _p.y = (_sy * (this.rH));

                    this.tPoints.push({p:_p, r:180*_pi});
                }

            }

        },
        drawTriangles: function(bin, showGrid) {

            var triangle = new Path.RegularPolygon({
                center: new Point(0,0),
                sides: 3,
                radius: this.radius,
                fillColor: '#000000' 
            });

            var singleTriangleSymbol = new Symbol(triangle);
            var wedge = new Group();

            // 16 small triangles
            for(var i=0;i<this.binary.length;i++) {

                var placedTriangle = new PlacedSymbol( singleTriangleSymbol );
                var point = new Point(view.center.x + this.tPoints[i].p.x, view.center.y + this.tPoints[i].p.y);

                placedTriangle.rotation = this.tPoints[i].r;
                placedTriangle.position = point;

                this.triangles.push( placedTriangle );
                wedge.addChild(placedTriangle);

            }

            var wedgeSymbol = new Symbol( wedge );
            var tile = new Group();

            for(var w=0;w<6;w++) {

                var placedWedge = new PlacedSymbol( wedgeSymbol );
                placedWedge.pivot = [0,this.rows*this.rH/-2];
                placedWedge.position = view.center;
                placedWedge.rotation = w * 60;
                tile.addChild(placedWedge);
            }

            var tileSymbol = new Symbol( tile );

            //start in the center and work outwards
            for(var tx=0;tx<this.tileCols;tx++) { 

                //odd number cols have + 1 vertical tile
                var tileRows = (tx % 2 > 0) ? this.tilesY : this.tilesY + 1;

                for(var ty=0;ty<tileRows;ty++) {

                    var placedTile = new PlacedSymbol( tileSymbol );
                    var offX = tx * this.tileRadius * 1.5;
                    var offY = (this.tileHeight * ty) - this.tileHeight + (this.tileHeight/2 * (tx%2));
                    var tp = new Point( view.center.x + offX, view.center.y + offY);
                    placedTile.position = tp;

                    if(tx>0) {

                        var placedTile = new PlacedSymbol( tileSymbol );
                        offX*=-1;
                        var tp = new Point( view.center.x + offX, view.center.y + offY);
                        placedTile.position = tp;
                    }

                }      

            }

            view.draw();

        },
        updateTriangles: function() {

            this.randomiseBinary();

        },
        randomiseBinary: function() {

            this.binaryX = this.binary;
            this.binary = "";

            for(var b=0;b<16;b++) {

                this.binary += Math.round(Math.random()).toString();

            }

        },
        convertDecimalToBinary: function(num) {

            if(num == 0) return "0";

            var _binaryString = '';	//start with empty string
            var _binaryArray = [];

            while(num > 0) {

                num /= 2;

                if(Math.floor(num) == num) {

                    _binaryArray.push("0");

                } else {

                    _binaryArray.push("1");
                    num = Math.floor(num);

                }
                
            }

            _binaryString = _binaryArray.join("");

            while(_binaryString.length<16) {

                _binaryString = "0" + _binaryString;
            }

            return _binaryString;
        }

    };

    app = new Stellar();
    app.plotPoints(true);
    app.drawTriangles();
    app.start();

});