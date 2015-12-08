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
	
	// Warm up heroku
	jQuery.ajax({
		type: 'get',
		url: 'http://' + host + '',
		contentType: 'text/plain',
		success: function (data) {
		}
	});
	
	// Read
	function readPosts(note, dataHandler) {
		jQuery.getJSON(
			'http://' + host + '/notes/' + note + '/posts',
			function (json) {
				for (var row of json) {
					row.data = JSON.parse(row.data);
				}
				dataHandler(json);
			}
		);
	}
	
	function fillZero(num) {
		if(num < 10) {
			return '0' + num.toString();
		} else {
			return num.toString();
		}	
	}
	
	function sendToMessage(row) {
		var date = new Date(row.created_at);
		var first = row.post_id + 
		' ：' + row.data.name +
		' ：' + date.getFullYear() + '/' +
		+ fillZero(date.getMonth()) + '/' +
		fillZero(date.getDate()) + ' ' +
		fillZero(date.getHours()) + ':' +
		fillZero(date.getMinutes()) + ':' +
		fillZero(date.getSeconds()) + ' ID:' +
		substring(row.data.remote_address);
		$gameMessage.add(first);
		var content = row.data.content;
		if (content) {
			$gameMessage.add(content);
		} else {
			$gameMessage.add('');
		}
	}
	
	function substring(str) {
		if(str) {
			return str.substring(0,3);
		} else {
			return '';	
		}
	} 
	
	// Write
	function writePost(note, name, content) {
		jQuery.ajax({
			type: 'post',
			url: 'http://' + host + '/notes/' + note + '/posts',
			contentType: 'application/json',
			data: JSON.stringify({name:name, content:content}),
			success: function(data) {
			}
		});
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
						if (data.length === 0) {
							$gameMessage.add('何も書かれていない。');
						} else {
							data.map(sendToMessage);
						}
					});
					break;
				case 'write':
					var name = prompt('名前を入力して下さい', '名無しさん#tripkey');
					if (!name) {
						break;
					}
					var content = prompt('一行で内容を入力して下さい', '') 
					if (!content) {
						break;
					}
					writePost(noteName, name, content);
					$gameMessage.add('雑記帳に内容が書き込まれた。');
					break;
            }
        }
    };
})();
