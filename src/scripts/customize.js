const $ = require("jquery");
const render = require("./render.js");
const initcy = require("./initcy.js");

export function customizeInit() {
  $(".menu_icon").click(function(){
    //console.log("Sidebar left is "+$(".sidebar").css("left")+"\nBody width is "+$("body").css("width"));
    var sidebar_open = $(".sidebar").css("left") !== $("body").css("width");
    //console.log("Menu icon clicked and I think the sidebar is "+sidebar_open+".\nTrying to change it to "+(!sidebar_open)+".");
    $(".sidebar").css({
      "left": (sidebar_open ? 100 : 70)+"%",
      "box-shadow": sidebar_open ? "0px 0px 0px 0px #303030" : "0px 0px 10px 3px #303030"
    });
  });
  // Initialize animations and toggle for tabs
  $(".node_viewer")[0].style.display = "flex";
  $(".customization")[0].style.display = "none";
  $(".customization_tab").css("border-bottom", "3px solid #303030");
  $(".customization_tab").css("border-left", "3px solid #303030");
  $(".customization_tab").click(function(){
    if (!$(".customization")[0].style.display || $(".customization")[0].style.display === "none") {
      $(".node_viewer").slideToggle();
      $(".customization").slideToggle();
      $(".sidebar_tab").css("border-bottom", "3px solid #303030");
      $(".sidebar_tab").css("border-right", "3px solid #303030");
      $(".customization_tab").css("border-bottom", "0px");
      $(".customization_tab").css("border-left", "0px");
    }
  });
  $(".sidebar_tab").click(function(){
    if (!$(".node_viewer")[0].style.display || $(".node_viewer")[0].style.display === "none") {
      $(".node_viewer").slideToggle();
      $(".customization").slideToggle();
      $(".sidebar_tab").css("border-bottom", "0px");
      $(".sidebar_tab").css("border-right", "0px");
      $(".customization_tab").css("border-bottom", "3px solid #303030");
      $(".customization_tab").css("border-left", "3px solid #303030");
    }
  });

  const light_colors = ["#649EE2", "#F75C03", "#F1C40F", "#00CC66", "#CB0CD1", "#53E0E0", "#E64747"];
  const dark_colors = ["#4772A3", "#A33900", "#AC8B0A", "#007E3F", "#9C09A1", "#41ADAD", "#C02B2B"];
  //var layout_buttons = $(".layout_button");
  $(".layout_button").each(function(i) {
    $(this).css("background-color", light_colors[i])
    $(this).mouseenter(function() {
      $(this).css("background-color", dark_colors[i])
    });
    $(this).mouseleave(function() {
      $(this).css("background-color", light_colors[i])
    });
  });
  // for (var i = 0; i < layout_buttons.length; i++) {
  //   layout_buttons[i].css("background-color", light_colors[i])
  //   layout_buttons[i].hover(function() {
  //     $(this).css("background-color", dark_colors[i])
  //   });
  // }
}