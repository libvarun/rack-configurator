﻿/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by APS Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

var viewer;
var fragslistforscale = [];
var fragslistfortilt = [];
let dbidsforscale = [20, 22, 24, 26,28,30]  // change these based on your model
let dbidsfortilt = [26]  // change these based on your model
function launchViewer(urn) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getApsToken
  };


  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('apsViewer'));
    viewer.start();
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  });
}

function onDocumentLoadSuccess(doc) {
  let viewables = doc.getRoot().getDefaultGeometry();
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // documented loaded, any action?
    let nav = viewer.navigation
    let pos = nav.getPosition()
    let target = nav.getTarget()
    let viewdir = new THREE.Vector3()
    viewdir.subVectors (pos, target).normalize()
    // zooms out by 100 along the view direction
    viewdir.multiplyScalar (100)
    pos.add(viewdir)

    nav.setPosition(pos)
    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, ()=>{
        const model = viewer.model;
        const instanceTree = model.getData().instanceTree;
        dbidsforscale.forEach(dbid=>{
          instanceTree.enumNodeFragments( dbid, ( fragId ) => {
            fragslistforscale.push(fragId)
          }, true );
        });
        dbidsfortilt.forEach(dbid=>{
          instanceTree.enumNodeFragments( dbid, ( fragId ) => {
            fragslistfortilt.push(fragId)
          }, true );
        });
    });
  });
}


function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function getApsToken(callback) {
  fetch('/api/auth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}