//=============================================================================
// MVNotes.js
//=============================================================================

/*:
 * @plugindesc Web Notes(like a BBS) plugin
 * @author Soichiro Yoshimura
 *
 * @param host
 * @desc mv-notes server's hostname (server source: https://github.com/sifue/mv-notes)
 * @default localhost
 *
 * Plugin Command:
 *   MVNotes read note_name     # replace notename to your note_name
 *   MVNotes write note_name    # replace notename to your note_name
 */

/*:ja
 * @plugindesc ウェブ雑記帳プラグイン
 * @author Soichiro Yoshimura
 *
 * @param host
 * @desc mv-notes のサーバーのホスト名 (サーバーのソースコード: https://github.com/sifue/mv-notes)
 * @default localhost
 *
 * Plugin Command:
 *   MVNotes read note_name     # note_name をノート名に変更してください
 *   MVNotes write note_name    # note_name をノート名に変更してください
 */
(function () {
	'use strict';
	
	var parameters = PluginManager.parameters('MVNotes');
	var host = String(parameters['host'] || 'Please set mv-notes server hostname');
	
	// Read
	function readPosts(note, dataHandler) {
		var http = require('http');
		http.get({
			hostname: host,
			port: 80,
			path: '/notes/' + note + '/posts',
			agent: false
		}, function (res) {
			res.setEncoding('utf8');
			res.on('data', function (str) {
				var json = JSON.parse(str);
				for (var row of json) {
					row.data = JSON.parse(row.data);
				}
				dataHandler(json);
			});
		});
	}
	
	function fillZero(num) {
		if(num < 10) {
			return '0' + num.toString();
		} else {
			return num.toString();
		}	
	}
	
	function sendToMessage(row) {
		console.log(row);
		var date = new Date(row.created_at);
		var first = row.post_id + 
		' ：' + row.data.name +
		' ：' + date.getFullYear() + '/' +
		+ fillZero(date.getMonth()) + '/' +
		fillZero(date.getDate()) + ' ' +
		fillZero(date.getHours()) + ':' +
		fillZero(date.getMinutes()) + ':' +
		fillZero(date.getSeconds());
		$gameMessage.add(first);
		var content = row.data.content.trim();
		$gameMessage.add(content);
	}
	
	// Write
	function writePost(note, name, content) {
		var http = require('http');
		var options = {
			hostname: host,
			port: 80,
			path: '/notes/' + note + '/posts',
			agent: false,
			method: 'POST',
			headers: {
          		'Content-Type': 'application/json',
			}
		};
		var req = http.request(options, function (res) {
			res.setEncoding('utf8');
			res.on('data', function (str) {
				console.log(str);
			});
		});
		req.write(JSON.stringify({name:name, content:content}));
		req.end();
	}
	
	// Hook command
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'MVNotes') {
			var noteName = args[1];
            switch (args[0]) {
				case 'read':
					readPosts(noteName, function (data) {
						data.map(sendToMessage);
					});
					break;
				case 'write':
					var name = prompt('名前を入力して下さい', '名無しさん');
					var content = prompt('一行で内容を入力して下さい', '') 
					writePost(noteName, name, content);
					$gameMessage.add('雑記帳に内容が書き込まれた。');
					break;
            }
        }
    };
})();
