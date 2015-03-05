// inject the ngRoute dependency in the module
var pairGram = angular.module('pairGram', ['ngRoute' ,'ui.ace']);
var socket = io.connect();