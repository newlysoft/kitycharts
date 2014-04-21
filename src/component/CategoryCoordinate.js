/**
 * 直角坐标系
 * @param {Array} dataSet
 *        要显示在坐标系上的数据集（每个元素需要 x, y 数据）
 *
 * @param {Number} width
 *        坐标系要渲染的宽度
 *
 * @param {Number} height
 *        坐标系要渲染的高度
 */
var CategoryCoordinate = kc.CategoryCoordinate = kity.createClass( "CategoryCoordinate", ( function () {
    function defaultFormat( number, index ) {
        if ( number > 1000 ) {
            return number / 1000 + 'K';
        }
        number = ( ( number * 10 ) | 0 ) / 10;
        return number;
    }

    var arrowParam = {
        w: 0,
        h: 1,
        a: 7,
        b: 2,
        c: 3,
        d: 0,
        t: 0
    };

    var componentsIniter = {
        "xMesh" : function(){
            this.addElement( 'xMesh', new kc.Mesh( {
                type: 'vertical'
            } ) );
        },
        "yMesh" : function(){
            this.addElement( 'yMesh', new kc.Mesh( {
                type: 'horizon',
                dir: 1
            } ) );
        },
        "xCat" : function(){
            this.addElement( 'xCat', new kc.Categories( {
                at: 'bottom'
            } ) );
        },
        "yCat" : function(){
            this.addElement( 'yCat', new kc.Categories( {
                at: 'left'
            } ) );
        },
        "xAxis" : function(){
            this.addElement( 'xAxis', new kc.Line( {
                color: '#999'
            } ) );

            this.canvas.addShape( this.xArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        },
        "yAxis" : function(){
            this.addElement( 'yAxis', new kc.Line( {
                color: '#999'
            } ) );

            this.canvas.addShape( this.yArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        }
    };

    return {
        base: kc.Coordinate,
        constructor: function ( param ) {

            this.callBase( kity.Utils.extend( {
                dataSet: [],
                width: 300,
                height: 300,
                heading: 20,
                unitX: null,
                unitY: null,
                meshX: true,
                meshY: true,
                formatX: null,
                formatY: null,
                rangeX: null,
                rangeY: null
            }, param ) );

            this._initRulers();
            this._initElements();

        },
        _initRulers: function () {
            this.xRuler = new kc.Ruler();
            this.yRuler = new kc.Ruler();
        },
        _initElements: function () {
            var func, components;
            components = this.param.components = (this.param.components === undefined)? ["xMesh", "yMesh", "xCat", "yCat", "xAxis", "yAxis"] : this.param.components;
            
            this.processComponents( componentsIniter );

        },
        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                'updateAll': [ 'dataSet', 'width', 'height', 'heading', 'unitX', 'unitY', 'meshX', 'meshY', 'formatX', 'formatY', 'rangeX', 'rangeY' ]
            } );
        },
        getXRuler: function () {
            return this.xRuler;
        },
        getYRuler: function () {
            return this.yRuler;
        },

        processComponents : function(composer){
            var com;
            for( com in this.param.components ){
                func = composer[ this.param.components[ com ] ];
                func && func.bind(this)();
            }
        },

        getXLabels : function(){
            return this.xLabels;
        },

        getYLabels : function(){
            return this.yLabels;
        },

        updateAll: function ( dataSet, width, height, heading, unitX, unitY, meshX, meshY, formatX, formatY, rangeX, rangeY ) {

            var xCategories = dataSet.xAxisCategories;
            var yCategories = dataSet.yAxisCategories;

            var query = new kc.Query( dataSet ),

                xFormat = formatX || defaultFormat,
                yFormat = formatY || defaultFormat

                ;

            var xRuler = this.xRuler, xMin, xMax, xDur, xGrid, xCount;
            var yRuler = this.yRuler, yMin, yMax, yDur, yGrid, yCount;

            if( xCategories ){
                rangeX = [0, xCategories.length-1];
            }

            if( yCategories ){
                rangeY = [0, yCategories.length-1];
            }

            if ( rangeX ) {

                xMin = rangeX[ 0 ];
                xMax = rangeX[ 1 ];
                xDur = xMax - xMin;

            } else {

                xMin = query.count() && query.min( 'x' ).x || 0;
                xMax = query.count() && query.max( 'x' ).x || 0;
                xDur = xMax - xMin;
                xDur = xDur || 40;
                xMin -= xDur / 4;
                xMax += xDur / 4;

            }

            if ( rangeY ) {

                yMin = rangeY[ 0 ];
                yMax = rangeY[ 1 ];
                yDur = yMax - yMin;

            } else {

                yMin = query.count() && query.min( 'y' ).y || 0;
                yMax = query.count() && query.max( 'y' ).y || 0;     
                yDur = yMax - yMin;
                yDur = yDur || 40;
                yMin -= yDur / 4;
                yMax += yDur / 4;

            }

            xRuler.ref( xMin, xMax ).map( 0, width );
            var xMod, xAlignRight;
            if(xCategories){
                xCount = xCategories.length;
                xMod = 1;
                xAlignRight = true;
            }else{
                xCount = width / 60 | 0;
            }
            xGrid = xRuler.gridByCount( xCount, xMod, xAlignRight );


            yRuler.ref( yMin, yMax ).map( height, 0 );
            var yMod, yAlignRight;
            if(yCategories){
                yCount = yCategories.length;
                yMod = 1;
                yAlignRight = true;
            }else{
                yCount = height / 40 | 0;
            }
            yGrid = yRuler.gridByCount( yCount, yMod, yAlignRight );


            var xAxis = this.getElement( 'xAxis' ),
                yAxis = this.getElement( 'yAxis' ),
                xCat  = this.getElement( 'xCat' ),
                yCat  = this.getElement( 'yCat' ),
                xMesh = this.getElement( 'xMesh' ),
                yMesh = this.getElement( 'yMesh' );

            xAxis && xAxis.update( {
                x1: 0,
                y1: height,
                x2: width,
                y2: height
            } );

            yAxis && yAxis.update( {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: height
            } );

            var xLabels = xCategories ? xCategories : xGrid.ref.map( xFormat );
            if(xCat){
                xCat.update( {
                    rules: xGrid.map,
                    labels: xLabels,
                    y: height
                } );
            }
            if(xCategories){
                this.xLabels = xLabels;
            }

            var yLabels = yCategories ? yCategories : yGrid.ref.map( yFormat );
            if(yCat){
                yCat.update( {
                    rules: yGrid.map,
                    labels: yLabels,
                    x: 0
                } );
            }
            if(yCategories){
                this.yLabels = yLabels;
            }

            xMesh && xMesh.update( {
                rules: xGrid.map,
                length: height - yGrid.map[ yGrid.map.length - 1 ],
                y: height
            } );

            yMesh && yMesh.update( {
                rules: yGrid.map,
                length: xGrid.map[ xGrid.map.length - 1 ],
                x: 0,
                y: 0
            } );

            this.xArrow && this.xArrow.setTransform( new kity.Matrix().translate( width, height + 0.5 ) );
            this.yArrow && this.yArrow.setTransform( new kity.Matrix().rotate( -90 ).translate( 0.5, 0 ) );
        }
    };
} )() );