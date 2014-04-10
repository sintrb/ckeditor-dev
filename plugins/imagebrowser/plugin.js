/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

/**
 * @fileOverview Defines the {@link CKEDITOR.imagebrowser} class, which represents a
 *      image browser in iamge dialog.
 *      this plugin added by Robin
 *      see https://github.com/sintrb/ckeditor-dev/
 */


(function() {
    CKEDITOR.plugins.add("imagebrowser", {
        requires: ["image", "ajax"],
        init: function(a) {

        }
    });
    CKEDITOR.on('dialogDefinition', function(ev) {
        var dialogName = ev.data.name;
        var editor = ev.editor;

        // image dialog defined and
        // editor.config.imageBrowserApiUrl not empty
        if (dialogName == 'image' && editor.config.imageBrowserApiUrl) {
            var dialogDefinition = ev.data.definition;

            // add a tab to dialog
            if (!dialogDefinition.getContents("browser")) {
                dialogDefinition.addContents({
                    id: 'browser',
                    label: editor.lang.common.browseServer,
                    elements: [{
                        id: 'loadmore',
                        type: 'button',
                        label: editor.lang.loadmore || '...',
                        onClick: function() {
                            this.getDialog().loadmoreimg();
                        }
                    }, {
                        id: 'imglist',
                        type: 'html',
                        html: '<div></div>',
                        style: 'max-height: 400px; overflow-y:auto;'
                    }]
                });
            }

            dialogDefinition.onLoad = function(ev) {

                // hold dialog object
                var dlg = this;

                // load more image function
                this.loadmoreimg = function() {
                    var imglst = this.getContentElement("browser", "imglist").getElement();
                    var url = editor.config.imageBrowserApiUrl;
                    url = url + (url.indexOf('?') == -1 ? "?" : "&") + "offset=" + this.getImageCount();
                    CKEDITOR.ajax.load(url, function(json) {
                        var res = JSON.parse(json);
                        if (res.success) {
                            // image item template
                            var tpl = '<img src="{url}" title="{title}" style="float:left; cursor:pointer; display:inline-block;width:90px; height:90px; border:1px solid; margin:2px;" />';

                            // image click function
                            var imgclick = function() {
                                // set img.src to txtUrl and switch to "info" tab
                                dlg.setValueOf("info", "txtUrl", this.getAttribute("src"));
                                dlg.selectPage("info");
                            };

                            // add image item
                            for (var i = 0; i < res.images.length; i++) {
                                var img = res.images[i];
                                var ele = tpl.replace('{url}', img.url).replace('{title}', img.title || img.url);
                                imglst.appendHtml(ele);
                                imglst.getChild(imglst.getChildCount() - 1).on("click", imgclick);
                            };

                            if (!res.hasmore) {
                                // no more image, remove loadmore button
                                dlg.getContentElement("browser", "loadmore").getElement().remove();
                            }
                        }
                    });
                }

                // get current image count
                this.getImageCount = function() {
                    return this.getContentElement("browser", "imglist").getElement().getChildCount();
                }


                this.oldSelectPage = this.selectPage;
                this.selectPage = function(pid) {
                    // load image when first select "browser" tab (no image)
                    // maybe use a flag variable is enough
                    if (pid == 'browser' && this.getImageCount() == 0) {
                        this.loadmoreimg();
                    }

                    this.oldSelectPage(pid);
                };
            };
        }
    });
})();