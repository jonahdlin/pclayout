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
}