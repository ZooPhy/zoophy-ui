$(document).ready(function() {
  am4core.useTheme(am4themes_material);
  am4core.useTheme(am4themes_animated);

  recordChart()
  locationChart()
  hostChart()
});

function recordChart(){
  var chart = am4core.create("recordChart", am4charts.XYChart);
  chart.paddingRight = 20;

  // Add data
  chart.data = [{
    "year": "2018-10-23",
    "value": 657296
  }, {
    "year": "2018-12-23",
    "value": 692743
  }, {
    "year": "2019-02-23",
    "value": 707271
  }];

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "year";
  categoryAxis.renderer.minGridDistance = 50;
  categoryAxis.renderer.grid.template.location = 0.5;
  categoryAxis.startLocation = 0.5;
  categoryAxis.endLocation = 0.5;

  // Create value axis
  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.baseValue = 0;

  // Create series
  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value";
  series.dataFields.categoryX = "year";
  series.strokeWidth = 2;
  series.minBulletDistance = 15;
  series.tooltipText = "{valueY}";
  series.tooltip.pointerOrientation = "vertical";
  series.tooltip.background.fillOpacity = 0.5;
  series.tooltip.label.padding(12,12,12,12)
  series.stroke = am4core.color("#D65DB1");

  var bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.circle.strokeWidth = 2;
  bullet.circle.radius = 4;
  bullet.circle.fill = am4core.color("#fff");

  var bullethover = bullet.states.create("hover");
  bullethover.properties.scale = 1.3;

  var range = valueAxis.createSeriesRange(series);
  range.value = 0;
  range.endValue = 1000;
  range.contents.stroke = am4core.color("#FF0000");
  range.contents.fill = range.contents.stroke;

  var label = categoryAxis.renderer.labels.template;
  label.wrap = true;
  label.minWidth = 150

  chart.cursor = new am4charts.XYCursor();
}

function locationChart(){
  // Create chart instance
  var chart = am4core.create("locationChart", am4charts.XYChart);
  chart.paddingRight = 20;

  // Add data
  chart.data = [{
    "year": "2018-10-23",
    "value": 624801
  }, {
    "year": "2018-12-23",
    "value": 686272
  }, {
    "year": "2019-02-23",
    "value": 700798
  }];

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "year";
  categoryAxis.renderer.minGridDistance = 50;
  categoryAxis.renderer.grid.template.location = 0.5;
  categoryAxis.startLocation = 0.5;
  categoryAxis.endLocation = 0.5;

  // Create value axis
  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.baseValue = 0;

  // Create series
  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value";
  series.dataFields.categoryX = "year";
  series.strokeWidth = 2;
  series.minBulletDistance = 15;
  series.tooltipText = "{valueY}";
  series.tooltip.pointerOrientation = "vertical";
  series.tooltip.background.fillOpacity = 0.5;
  series.tooltip.label.padding(12,12,12,12)

  var bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.circle.strokeWidth = 2;
  bullet.circle.radius = 4;
  bullet.circle.fill = am4core.color("#fff");

  var bullethover = bullet.states.create("hover");
  bullethover.properties.scale = 1.3;

  var range = valueAxis.createSeriesRange(series);
  range.value = 0;
  range.endValue = 1000;
  range.contents.stroke = am4core.color("#FF0000");
  range.contents.fill = range.contents.stroke;

  var label = categoryAxis.renderer.labels.template;
  label.wrap = true;
  label.minWidth = 150

  chart.cursor = new am4charts.XYCursor();
}

function hostChart(){
  var chart = am4core.create("hostChart", am4charts.XYChart);
  chart.paddingRight = 20;

  chart.data = [{
    "year": "2018-10-23",
    "value": 614012
  }, {
    "year": "2018-12-23",
    "value": 634171
  }, {
    "year": "2019-02-23",
    "value": 648019
  }];

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "year";
  categoryAxis.renderer.minGridDistance = 50;
  categoryAxis.renderer.grid.template.location = 0.5;
  categoryAxis.startLocation = 0.5;
  categoryAxis.endLocation = 0.5;

  // Create value axis
  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.baseValue = 0;

  // Create series
  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.valueY = "value";
  series.dataFields.categoryX = "year";
  series.strokeWidth = 2;
  series.minBulletDistance = 15;
  series.tooltipText = "{valueY}";
  series.tooltip.pointerOrientation = "vertical";
  series.tooltip.background.fillOpacity = 0.5;
  series.tooltip.label.padding(12,12,12,12)
  series.stroke = am4core.color("#FF6F91");

  var bullet = series.bullets.push(new am4charts.CircleBullet());
  bullet.circle.strokeWidth = 2;
  bullet.circle.radius = 4;
  bullet.circle.fill = am4core.color("#fff");

  var bullethover = bullet.states.create("hover");
  bullethover.properties.scale = 1.3;

  var range = valueAxis.createSeriesRange(series);
  range.value = 0;
  range.endValue = 1000;
  range.contents.stroke = am4core.color("#FF0000");
  range.contents.fill = range.contents.stroke;

  var label = categoryAxis.renderer.labels.template;
  label.wrap = true;
  label.minWidth = 150

  chart.cursor = new am4charts.XYCursor();
}