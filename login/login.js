import express from 'express';
import Database from './database.js';
import { config } from './config.js';

$('.message a').click(function(){
  $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});