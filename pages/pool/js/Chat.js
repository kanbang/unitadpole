// Settings controls

import {
    keys
} from "./keys.js";

import {
    app
} from "./main.js";

import {
    is_panel_showing
} from "./Ui.js";


(function($) {

    $.fn.initChat = function() {
        var chatInput = this;
        var chatText = $("#chatText");
        var hidden = true;
        var messageHistory = [];
        var messagePointer = -1;

        var closechat = function() {
            hidden = true;
            chatInput.css("opacity", "0");
            messagePointer = messageHistory.length;
            chatInput.val('');
            chatText.text('')
        }

        var updateDimensions = function() {
            chatText.text(chatInput.val());
            var width = chatText.width() + 30;
            chatInput.css({
                width: width,
                marginLeft: (width / 2) * -1
            });
        };

        chatInput.blur(function(e) {
            if (is_panel_showing) return;

            setTimeout(function() { chatInput.focus() }, 0.1);
        });

        chatInput.keydown(function(e) {
            if (is_panel_showing) return;

            if (chatInput.val().length > 0) {
                //set timeout because event occurs before text is entered
                setTimeout(updateDimensions, 0.1);
                chatInput.css("opacity", "1");
            } else {
                closechat();
            }

            if (!hidden) {

                e.stopPropagation();
                if (messageHistory.length > 0) {
                    if (e.keyCode == keys.up) {
                        if (messagePointer > 0) {
                            messagePointer--;
                            chatInput.val(messageHistory[messagePointer]);
                        }
                    } else if (e.keyCode == keys.down) {
                        if (messagePointer < messageHistory.length - 1) {
                            messagePointer++;
                            chatInput.val(messageHistory[messagePointer]);
                        } else {
                            closechat();
                            return;
                        }
                    }
                }
            }
        });

        chatInput.keyup(function(e) {
            if (is_panel_showing) return;

            var k = e.keyCode;
            if (chatInput.val().length >= 45) {
                chatInput.val(chatInput.val().substr(0, 45));
            }

            if (chatInput.val().length > 0) {
                updateDimensions();
                chatInput.css("opacity", "1");
                hidden = false;
            } else {
                closechat();
            }
            if (!hidden) {
                if (k == keys.esc || k == keys.enter || (k == keys.space && chatInput.val().length > 35)) {
                    if (k != keys.esc && chatInput.val().length > 0) {
                        messageHistory.push(chatInput.val());
                        messagePointer = messageHistory.length;
                        app.parseSendMessage(chatInput.val());
                    }
                    closechat();
                }

                e.stopPropagation();
            }
        });

        chatInput.focus();
    }

    $(function() {
        // $('#chat').initChat();
    });
})(jQuery);