(function(config) {
    for (var k in config) {
        Core.CONFIG[k] = config[k]
    }
}
)({
    UpEngine: 0,
    FUpImg: STATIC_DIR + "/swfup/v4_up_btn.png?v=2",
    FUpRsa1: "",
    FUpRsa2: "",
    FUpErrMsg: {
        "-100": "文件数量已超限制",
        "-110": "大小不能超过%1",
        "-120": "不能上传空文件",
        "-130": "无效的文件类型",
        "-200": "网络不正常，上传中断",
        "-210": "上传地址丢失",
        "-220": "网络异常",
        "-230": "不安全的上传",
        "-240": "上传限制超标",
        "-250": "上传失败",
        "-260": "未找到指定的文件",
        "-270": "文件验证失败",
        "-280": "文件列队取消",
        "-290": "上传已停止",
        "-300": "服务器异常"
    },
    TUpCodeBase_NB: STATIC_DIR + "/install/115upload_" + PAGE_UPLOAD_OCX_VERSION.WIN + ".cab",
    TUpDownloadUrl_np: STATIC_DIR + "/install/115upload_" + PAGE_UPLOAD_OCX_VERSION.WIN + ".exe",
    TUpDownloadUrl_np_mac: STATIC_DIR + "/install/115upload_" + PAGE_UPLOAD_OCX_VERSION.MAC + ".dmg",
    TUpDownloadUrl_np_unix: STATIC_DIR + "/install/115upload_" + PAGE_UPLOAD_OCX_VERSION.UNIX + "_x64.tar.gz",
    TUpDownloadUrl_np_unix_32: STATIC_DIR + "/install/115upload_" + PAGE_UPLOAD_OCX_VERSION.UNIX + "_x86.tar.gz",
    TUpCodeBase_NB_2014: STATIC_DIR + "/install/2014/115upload_" + PAGE_UPLOAD_OCX_VERSION_2014.WIN + ".cab",
    TUpDownloadUrl_np_2014: STATIC_DIR + "/install/2014/115upload_" + PAGE_UPLOAD_OCX_VERSION_2014.WIN + ".exe",
    TUpDownloadUrl_np_mac_2014: STATIC_DIR + "/install/2014/115upload_" + PAGE_UPLOAD_OCX_VERSION_2014.MAC + ".dmg",
    TUpDownloadUrl_np_unix_2014: STATIC_DIR + "/install/2014/115upload_" + PAGE_UPLOAD_OCX_VERSION_2014.UNIX + "_x64.tar.gz",
    TUpDownloadUrl_np_unix_32_2014: STATIC_DIR + "/install/2014/115upload_" + PAGE_UPLOAD_OCX_VERSION_2014.UNIX + "_x86.tar.gz",
    TUpClassID_NB: "clsid:CC98CADB-E94C-4240-9723-3E0707271E17",
    TUpClassID_NB_2014: "CLSID:97DB47F7-FFE3-41ED-A59A-E21515630FE0",
    TUpSp: "0",
    TUpDomId: "js_ocx_control_object",
    TUpFFVersion: "",
    TUpMacVersion: "",
    TUpUnixVersion: "",
    TUpFFVersion2014: "",
    TUpMacVersion2014: "",
    TUpUnixVersion2014: "",
    TUpTestVersion: {},
    TUploadServer: "",
    TDeleteServer: "",
    TSelectCount: 20,
    TUpRefashFreq: 50,
    TUpIsProxy: 0,
    TUpReTryCount: 15,
    TUpSleepTime: 2,
    OpenUpDir: [1, 2, 3, 4, 9, 49]
});
(function() {
    var upload = Core.Upload = (function() {
        var _cache = {
            aid: 1,
            cid: 0
        }, _engineType = 1, _reloadTimer;
        var getTimed = function(str) {
            var arr = str.split(":")
              , time = 0;
            try {
                if (arr) {
                    time += arr[0] * 1 ? arr[0] * 1 * 3600 : 0;
                    time += arr[1] * 1 ? arr[1] * 1 * 60 : 0;
                    time += arr[2] * 1 ? arr[2] * 1 : 0
                }
            } catch (e) {}
            return time
        };
        var accountTimer;
        var speed = 0;
        var startTime;
        var count = 0;
        var totalSize = 0;
        var totalComplete = 0;
        var hasOCX = false;
        var maxCount = 0;
        var totalTime = 0;
        var markCount = function() {
            var files = upload.ui.GetAllFiles(_cache);
            count = 0;
            totalSize = 0;
            totalTime = 0;
            maxCount = 0;
            var completeSize = 0;
            hasOCX = false;
            speed = 0;
            for (var k in files) {
                var item = files[k];
                if (item.up_type == 1) {
                    if ($.inArray(item.status, [1, 2]) != -1) {
                        totalSize += item.size;
                        if (item.loaded) {
                            completeSize += item.loaded
                        }
                        count++
                    }
                } else {
                    if (item.up_type == 3) {
                        if ($.inArray(item.status, [1, 2, 4]) != -1) {
                            totalSize += item.size;
                            if (item.file_count < 2) {
                                count++
                            } else {
                                count += item.file_count - item.upload_count
                            }
                            maxCount += item.file_count;
                            completeSize += item.upload_count;
                            if (item.speed) {
                                speed += item.speed
                            }
                            totalTime += getTimed(item.left_time)
                        }
                    } else {
                        if (Number(item.status) == 4) {
                            totalSize += item.size;
                            if (item.complete) {
                                completeSize += item.complete
                            }
                            count++;
                            hasOCX = true
                        }
                    }
                }
            }
            totalComplete = completeSize;
            accountOCXCountText()
        };
        var accountOCXCountText = function() {
            if (hasOCX) {
                accountOCXCountText.accountTimer = window.setTimeout(function() {
                    if (hasOCX) {
                        if (count) {
                            upload.ui.Message(count + "个文件正在上传，共" + Util.File.ShowSize(totalSize, 1), count + "个文件正在上传，共" + Util.File.ShowSize(totalSize, 1))
                        } else {
                            upload.ui.Message("<i class='hint-icon hint-suc-s' style='position:relative;top:3px;margin-right:3px;'></i>上传完成，<a href='http://ie.115.com' target='_blank'>使用115电脑版可上传文件夹</a>", "", true)
                        }
                    }
                    if (accountOCXCountText.accountTimer) {
                        window.clearTimeout(accountOCXCountText.accountTimer)
                    }
                }, 100)
            }
        };
        var getEngine = function(type) {
            if (type == undefined) {
                type = _engineType
            }
            switch (type) {
            case 1:
                if (!_cache.initFUpload) {
                    _cache.initFUpload = true;
                    upload.FUpload.Install({
                        ready: function(up) {},
                        file_added: function(file) {
                            if (!file) {
                                return
                            }
                            file.up_type = 1;
                            upload.ui.Add(file)
                        },
                        file_add_end: function(up, files) {
                            markCount()
                        },
                        start: function(file) {
                            startTime = new Date().getTime();
                            markCount()
                        },
                        error: function(file, code, msg) {
                            if (file) {
                                upload.ui.Update(file);
                                markCount()
                            }
                        },
                        progress: function(file, files) {
                            if (!file) {
                                return
                            }
                            upload.ui.Update(file);
                            if (!hasOCX) {
                                var less = new Date().getTime() - startTime;
                                if (file.loaded > 10) {
                                    speed = (file.loaded * 1024) / less
                                }
                                accountTimer = window.setTimeout(function() {
                                    if (!hasOCX) {
                                        if (count) {
                                            var less = Math.floor((totalSize - totalComplete) / 1024 / speed * 1000);
                                            var lessTime = "";
                                            if ((less + "").indexOf("Infinity") == -1) {
                                                lessTime = Util.Date.GetTimeText(less)
                                            }
                                            upload.ui.Message(count + "个文件正在上传，共" + Util.File.ShowSize(totalSize, 1) + " (" + Util.File.ShowSize(speed, 1) + "/S) " + lessTime, "上传" + count + "个文件，共" + Util.File.ShowSize(totalSize, 1) + " (" + Util.File.ShowSize(speed, 1) + "/S)")
                                        } else {
                                            var linkItem = "<a href='http://pc.115.com' target='_blank'>使用115电脑版可上传文件夹</a>";
                                            if (_cache.config && _cache.config.hideBottomBtn) {
                                                linkItem = ""
                                            }
                                            upload.ui.Message(linkItem, "", true)
                                        }
                                    }
                                    if (accountTimer) {
                                        window.clearTimeout(accountTimer)
                                    }
                                }, 100)
                            }
                        },
                        uploaded: function(file, data) {
                            if (!file) {
                                return
                            }
                            if (accountTimer) {
                                window.clearTimeout(accountTimer)
                            }
                            file.checking = 1;
                            upload.ui.Update(file, data);
                            window.setTimeout(function() {
                                file.checking = 0;
                                upload.ui.Update(file, data)
                            }, 1000);
                            markCount()
                        },
                        file_removeed: function(file) {
                            markCount()
                        },
                        dragover: function() {
                            inState = true
                        },
                        dragleave: function() {
                            inState = false
                        },
                        drop: function() {
                            var dom = $("#" + upload.CONFIG.DropID);
                            dom.hide();
                            inState = false
                        },
                        limitSize: _cache.config && _cache.config.limitSize || ""
                    })
                }
                return upload.FUpload;
            case 2:
                if (!_cache.initTUpload) {
                    _cache.initTUpload = true;
                    upload.TUpload.Actions = {
                        add: function(file) {
                            file.up_type = 2;
                            upload.ui.Add(file);
                            if (file.error) {
                                upload.ui.Update(file, {
                                    text: file.error,
                                    err: 1
                                })
                            }
                            markCount()
                        },
                        msg: function(file, msg, status) {
                            upload.ui.Update(file, {
                                text: msg
                            })
                        },
                        progress: function(file) {
                            upload.ui.Update(file);
                            if (!hasOCX) {
                                hasOCX = true;
                                markCount()
                            }
                            accountOCXCountText()
                        },
                        error: function(file, msg) {
                            upload.ui.Update(file, {
                                text: msg,
                                err: 1
                            });
                            accountOCXCountText()
                        },
                        pause: function(file) {
                            upload.ui.Pause(file);
                            accountOCXCountText()
                        },
                        success: function(file) {
                            upload.ui.Update(file);
                            markCount();
                            accountOCXCountText()
                        },
                        reloadpage: function(aid, cid) {
                            upload.ReloadPage(aid, cid)
                        },
                        ctl_button: function(file, pause, conti) {
                            upload.ui.CTLButton(file, pause, conti)
                        },
                        is_exist: function(file) {
                            return upload.ui.IsExist(file)
                        },
                        delete_file: function(file) {
                            upload.ui.Delete(file)
                        }
                    }
                }
                return upload.TUpload;
            case 3:
                if (!_cache.initAUpload) {
                    _cache.initTUpload = true;
                    upload.AUpload.Actions = {
                        add: function(file) {},
                        msg: function(file, msg, status) {},
                        count_text: function() {},
                        progress: function(file) {},
                        error: function(file, msg) {},
                        pause: function(file) {},
                        success: function(file) {},
                        reloadpage: function(aid, cid) {
                            upload.ReloadPage(aid, cid)
                        },
                        ctl_button: function(file, pause, conti) {},
                        is_exist: function(file) {},
                        delete_file: function(file) {}
                    }
                }
                return upload.AUpload
            }
        };
        var inState = false;
        var drop = function() {
            $(document).bind("keyup", function(e) {
                if (e.ctrlKey && e.shiftKey && e.keyCode == 220) {
                    Core.CONFIG.TUpDebugTime++;
                    if (Core.CONFIG.TUpDebugTime > 5) {
                        if (!Core.CONFIG.TUpDebugKey) {
                            Core.CONFIG.TUpDebugKey = true;
                            Core.MinMessage.Show({
                                text: "调试已开启",
                                type: "suc",
                                timeout: 2000
                            })
                        }
                    }
                }
            });
            if (Core.CONFIG.HTML5 || window.uploadInterface) {
                $(function() {
                    var dom = $('<div id="' + upload.CONFIG.DropID + '" style="display:none;" class="drop-box-shadow"><i></i></div>');
                    $(document.body).append(dom);
                    dom.on("click", function() {
                        dom.hide();
                        return false
                    });
                    var timer;
                    var overStatus = false;
                    upload.WinDragOver = function(e, callback) {
                        if (callback) {
                            Core.Upload.fileSuccess = callback
                        }
                        overStatus = true;
                        if (window.uploadInterface && !window.IS_HIDDEN_MODE) {
                            dom.is(":hidden") && dom.show();
                            return
                        }
                        if (e) {
                            e.stopPropagation();
                            e.preventDefault()
                        }
                        var tran = e.originalEvent.dataTransfer;
                        if (tran) {
                            var types = tran.types;
                            if (/webkit/.test(navigator.userAgent.toLowerCase())) {
                                if (types.indexOf("Files") == -1) {
                                    return false
                                }
                            } else {
                                if (types.length) {
                                    if (types[types.length - 1].indexOf("Files") == -1) {
                                        return false
                                    }
                                } else {
                                    return false
                                }
                            }
                        }
                        if (timer) {
                            window.clearTimeout(timer)
                        }
                        var aid = _cache.aid = Number(Core.FileConfig.aid) != -1 ? Core.FileConfig.aid : 1;
                        var cid = _cache.cid = Core.FileConfig.cid != -1 ? Core.FileConfig.cid : 0;
                        dom.is(":hidden") && dom.show();
                        open(function() {
                            var engine = getEngine(1);
                            if (overStatus) {
                                dom.is(":hidden") && dom.show()
                            }
                            dom.is(":hidden") && dom.show();
                            engine.SetConfig(aid, cid)
                        })
                    }
                    ;
                    upload.WinDrayleave = function(e) {
                        overStatus = false;
                        if (window.uploadInterface && !window.IS_HIDDEN_MODE) {
                            (!dom.is(":hidden")) && dom.hide();
                            return
                        }
                        if (e) {
                            e.stopPropagation();
                            e.preventDefault()
                        }
                        if (timer) {
                            window.clearTimeout(timer)
                        }
                        timer = window.setTimeout(function() {
                            if (!inState) {
                                dom.hide()
                            }
                        }, 100)
                    }
                    ;
                    upload.WinDrayUp = function(e) {
                        overStatus = false;
                        if (window.uploadInterface && !window.IS_HIDDEN_MODE) {
                            (!dom.is(":hidden")) && dom.hide();
                            var aid = _cache.aid = Number(Core.FileConfig.aid) != -1 ? Core.FileConfig.aid : 1;
                            var cid = _cache.cid = Core.FileConfig.cid != -1 ? Core.FileConfig.cid : 0;
                            open(function() {
                                if (!overStatus) {
                                    dom.is(":hidden") && dom.hide()
                                }
                                if (window.browserInterface) {
                                    browserInterface.SetCurWangpanCid("U_" + aid + "_" + (cid ? cid : 0))
                                }
                            });
                            return
                        }
                    }
                    ;
                    window.OOF_UPLOAD_DRAGOVER = upload.WinDragOver;
                    window.OOF_UPLOAD_DRAGLEAVE = upload.WinDrayleave;
                    window.OOF_UPLOAD_DRAGUP = upload.WinDrayUp;
                    if (!window.uploadInterface || window.IS_HIDDEN_MODE) {
                        $(window).on("dragover", upload.WinDragOver);
                        $(window).on("dragleave", upload.WinDrayleave);
                        $(window).on("drop", function(e) {
                            if (window.IS_HIDDEN_MODE) {
                                return false
                            }
                            if (window.uploadInterface) {
                                return
                            }
                            return false
                        })
                    }
                })
            }
        };
        drop();
        var open = function(callback) {
            if (Core.Update115Browser && !(_cache.config && _cache.config.useFUpload)) {
                var engine = getEngine(3);
                engine.SetConfig(_cache.aid, _cache.cid);
                engine.Select();
                return false
            }
            if (!upload.ReadyUI) {
                Core.MinMessage.Show({
                    text: "未载入UI文件",
                    type: "war",
                    timeout: 2000
                });
                return false
            }
            if (!upload.ui) {
                $(window).on("beforeunload", function() {
                    try {
                        Util.log("反注册成功");
                        window.downloadInterface.RemoveRegisterCallBack("OOF_UPLOAD_UPDATE_CALLBACK");
                        window.downloadInterface.RemoveRegisterCallBack("OOF_UPLOAD_LOAD_BATCH_CALLBACK")
                    } catch (e) {}
                    if (count) {
                        if (/msie/.test(navigator.userAgent.toLowerCase())) {
                            event.returnValue = "文件正在上传"
                        }
                        return "文件正在上传"
                    }
                });
                upload.ReadyUI({
                    "delete": function(file) {
                        markCount();
                        if (file.up_type == 1) {
                            upload.FUpload.Delete(file)
                        } else {
                            if (file.up_type == 3) {
                                upload.AUpload.Delete(file)
                            } else {
                                upload.TUpload.Delete(file)
                            }
                        }
                    },
                    init: function(warp) {
                        warp.find("#" + upload.CONFIG.TUpDomId).on("click", function() {
                            if (Core.Update115) {
                                upload.AUpload.Select()
                            } else {
                                upload.TUpload.Select()
                            }
                            return false
                        })
                    },
                    pause: function(file) {
                        markCount();
                        if (file.up_type == 2) {
                            upload.TUpload.Pause(file)
                        } else {
                            if (file.up_type === 3) {
                                upload.AUpload.Pause(file)
                            }
                        }
                    },
                    reupload: function(file) {
                        markCount();
                        if (file.up_type == 2) {
                            upload.TUpload.Reupload(file)
                        } else {
                            if (file.up_type == 3) {
                                upload.AUpload.Reupload(file)
                            }
                        }
                    },
                    getinfo: function(id) {
                        markCount();
                        upload.AUpload.GetErrorList(id)
                    }
                })
            }
            upload.ui.Open(function() {
                callback && callback()
            })
        };
        var _indTime = new Date().getTime();
        return {
            Show: function(aid, cid, notSelect, callback, config) {
                _cache.aid = aid;
                _cache.cid = cid;
                config && (_cache.config = config);
                if (callback) {
                    Core.Upload.fileSuccess = callback
                }
                open(function() {
                    var engine;
                    if (aid !== "sharedFolder" && Core.Update115) {
                        engine = getEngine(3);
                        engine.SetConfig(_cache.aid, _cache.cid)
                    } else {
                        if (Core.CONFIG.UpEngine && !upload.TUpload.isInstall()) {
                            engine = upload.ChangeEngine(0)
                        } else {
                            engine = getEngine(Core.CONFIG.UpEngine ? 2 : 1);
                            engine.SetConfig(_cache.aid, _cache.cid)
                        }
                    }
                    if (!notSelect) {
                        if (engine && engine.Select) {
                            engine.Select()
                        }
                    }
                })
            },
            SetConfig: function(config) {
                _cache.config = config
            },
            GetCache: function() {
                return _cache
            },
            TUpLoadError: function() {},
            WriteOCX: function() {
                this.TUpload.Install()
            },
            ChangeEngine: function(UpEngine, TUpSp) {
                Core.CONFIG.UpEngine = UpEngine;
                var ispUp = 0;
                if (TUpSp) {
                    Core.CONFIG.TUpSp = Number(TUpSp)
                }
                var key = "set_engine";
                if (_cache[key]) {
                    var funs = _cache[key];
                    for (var i = 0, len = funs.length; i < len; i++) {
                        var item = funs[i];
                        item && item(Core.CONFIG.UpEngine, Core.CONFIG.TUpSp)
                    }
                }
                var engine;
                if (Core.Update115) {
                    engine = getEngine(3)
                } else {
                    engine = getEngine(Core.CONFIG.UpEngine ? 2 : 1)
                }
                engine.SetConfig(_cache.aid, _cache.cid);
                if (engine.SetISPType) {
                    engine.SetISPType(Core.CONFIG.TUpSp)
                }
                return engine
            },
            AddSetEngineClient: function(fun) {
                var key = "set_engine";
                if (!_cache[key]) {
                    _cache[key] = []
                }
                _cache[key].push(fun);
                this.ChangeEngine(Core.CONFIG.UpEngine, Core.CONFIG.TUpSp)
            },
            GetTUploadInstall: function() {
                return this.TUpload.isInstall()
            },
            ReloadPage: function(aid, cid) {
                if (_reloadTimer) {
                    window.clearTimeout(_reloadTimer)
                }
                _reloadTimer = window.setTimeout(function() {
                    if (Core.FileConfig.DataAPI) {
                        Core.FileConfig.DataAPI.Reload(aid, cid)
                    }
                    Core.SpaceData.Sync();
                    if (_reloadTimer) {
                        window.clearTimeout(_reloadTimer)
                    }
                }, 1200)
            },
            ReuploadByPickCode: function(pick_code) {
                if (this.TUpload.isInit()) {
                    for (var i = 0, len = pick_code.length; i < len; i++) {
                        var item = pick_code[i];
                        this.TUpload.ReuploadByPickCode(item)
                    }
                } else {
                    this.TUpload.initCallback = function() {
                        window.setTimeout(function() {
                            for (var i = 0, len = pick_code.length; i < len; i++) {
                                var item = pick_code[i];
                                upload.TUpload.ReuploadByPickCode(item)
                            }
                        }, 20)
                    }
                }
                open(function() {
                    var engine = getEngine(2);
                    engine.SetConfig(_cache.aid, _cache.cid)
                })
            },
            fileSuccess: function() {},
            CONFIG: {
                UploadBtn: "js_up_new_btn" + _indTime,
                FUploadBtn: "js_fup_new_btn" + _indTime,
                TUpDomId: "js_tup_new_obj" + _indTime,
                WIDTH: 122,
                HEIGHT: 44,
                QUALITY: 90,
                DropID: "js_upload_ui_box" + _indTime,
                UploadBox: "js_up_new_box" + _indTime
            }
        }
    }
    )()
}
)();
(function(ctl) {
    var fup = ctl.FUpload = (function() {
        var _up, _is_loader, _par, _cache = {}, _ERROR = {
            "-200": "网络异常",
            "-300": "网络异常",
            "-301": "文件名过长",
            "-302": "不能上传空文件或文件夹",
            "-400": "不安全的上传",
            "-500": "初始化失败",
            "-600": "文件大于%1请使用115电脑版上传",
            "-601": "无效的文件类型",
            "-602": "不能上传空文件或文件夹",
            "-700": "无效的图片",
            "-701": "图片格式不正确",
            "-702": "上传已停止",
            "-800": "空间不足"
        };
        var loadObj = function(callback) {
            var jsPath = "//cdnassets.115.com/??libs/plupload/plupload.js";
            if (!window.oofUtil) {
                jsPath += ",oofUtil.js,ajax/ossUpload.js"
            } else {
                if (!oofUtil.ossUpload) {
                    jsPath += ",ajax/ossUpload.js"
                }
            }
            Util.Load.JS(jsPath, function() {
                callback && callback(plupload.Uploader)
            })
        };
        return {
            Delete: function(file) {
                if (_up) {
                    if (file.status == 2) {
                        _up.stop();
                        _up.removeFile(file);
                        _up.start()
                    } else {
                        _up.removeFile(file)
                    }
                }
            },
            SetConfig: function(aid, cid) {
                _cache.aid = aid;
                _cache.cid = cid
            },
            GetAllFiles: function() {
                if (_up) {
                    return _up.getAllFiles()
                } else {
                    return []
                }
            },
            Select: function() {
                if (Core.CONFIG.HTML5 && _up) {
                    $("#" + _up.id + "_html5").click()
                }
            },
            Install: function(actions) {
                if (!_up) {
                    if (!actions) {
                        actions = {}
                    }
                    loadObj(function(uploader) {
                        var limit = actions.limitSize || 200;
                        UPLOAD_CONFIG_H5.size_limit = limit * 1024 * 1024;
                        var st = {
                            runtimes: Core.CONFIG.HTML5 ? "html5" : "flash",
                            withCredentials: true,
                            browse_button: ctl.CONFIG.UploadBtn,
                            container: ctl.CONFIG.FUploadBtn,
                            max_file_size: Util.File.ShowSize(UPLOAD_CONFIG_H5.size_limit, 0),
                            url: UPLOAD_CONFIG_H5.url,
                            resize: {
                                width: ctl.CONFIG.WIDTH,
                                height: ctl.CONFIG.HEIGHT,
                                quality: ctl.CONFIG.QUALITY
                            },
                            flash_swf_url: "/static/plug/upload/plupload.flash.swf",
                            filters: [{
                                title: "all files",
                                extensions: "*"
                            }]
                        };
                        if (!window.uploadInterface || window.IS_HIDDEN_MODE) {
                            st.drop_element = ctl.CONFIG.DropID
                        }
                        _up = new uploader(st);
                        _up.bind("Init", function(up, params) {
                            Core.Debug.write("Current runtime: " + params.runtime);
                            actions.ready && actions.ready(up, params)
                        });
                        var isStart = false;
                        _up.bind("FilesAdded", function(up, files) {
                            var nopassList = [];
                            isStart = false;
                            for (var i in files) {
                                var file = files[i];
                                if (Util.Validate.mb_strlen(file.name) > 451) {
                                    file.error = _ERROR["-301"];
                                    file.status = 4;
                                    nopassList.push(file)
                                } else {
                                    if (!Number(file.size)) {
                                        file.error = _ERROR["-302"];
                                        file.status = 4;
                                        nopassList.push(file)
                                    } else {
                                        if (!_cache.FileSizeTotal) {
                                            _cache.FileSizeTotal = {};
                                            var spaceData = Core.SpaceData.GetData();
                                            for (var k in spaceData) {
                                                if (!_cache.FileSizeTotal[k]) {
                                                    _cache.FileSizeTotal[k] = {}
                                                }
                                                _cache.FileSizeTotal[k].used = Number(spaceData[k].used);
                                                _cache.FileSizeTotal[k].total = Number(spaceData[k].total)
                                            }
                                        }
                                        var spaceKey = _cache.aid ? _cache.aid : 1;
                                        if (Number(spaceKey) > 0 && Number(spaceKey) != 5) {
                                            spaceKey = 1
                                        }
                                        var useSizeItem = _cache.FileSizeTotal[spaceKey.toString()];
                                        if (useSizeItem) {
                                            if ((Number(useSizeItem.used) + Number(file.size)) > Number(useSizeItem.total)) {
                                                file.error = _ERROR["-800"];
                                                file.status = 4;
                                                nopassList.push(file)
                                            } else {
                                                useSizeItem.used = Number(useSizeItem.used) + Number(file.size)
                                            }
                                        }
                                    }
                                }
                                if (window.IS_ALBUM_UPLOAD) {
                                    var fileName = file.name;
                                    var suffix = "";
                                    if (fileName.lastIndexOf(".") != -1) {
                                        suffix = fileName.substring(fileName.lastIndexOf("."), fileName.length).replace(".", "")
                                    }
                                    var item = window.UPLOAD_CONFIG[_cache.aid];
                                    if (suffix && typeof item.upload_type_limit == "object" && $.inArray(suffix.toLowerCase(), item.upload_type_limit) == -1) {
                                        file.error = _ERROR["-601"];
                                        file.status = 4;
                                        nopassList.push(file)
                                    }
                                }
                                file.aid = _cache.aid;
                                file.cid = _cache.cid;
                                if (!file.error) {
                                    isStart = true
                                }
                                actions.file_added && actions.file_added(file);
                                Core.Debug.write("selected: id:" + file.id + " name:" + file.name + " size:" + file.size + " iserr:" + (file.error ? 0 : file.error))
                            }
                            actions.file_add_end && actions.file_add_end(_up, files);
                            for (var i = 0, len = nopassList.length; i < len; i++) {
                                var file = nopassList[i];
                                actions.error && actions.error(file);
                                _up.removeFile(file)
                            }
                        });
                        _up.bind("QueueChanged", function() {
                            if (isStart) {
                                _up.start()
                            }
                        });
                        _up.bind("FilesRemoved", function(file) {
                            Core.Debug.write("remove file: id:" + file.id + " name:" + file.name + " size:" + file.size);
                            actions.file_removeed && actions.file_removeed(file)
                        });
                        _up.bind("BeforeUpload", oofUtil.ossUpload.plupHelper(function(up, file) {
                            actions.start && actions.start(file);
                            Core.Debug.write("\nstart: id:" + file.id + " name:" + file.name + " size:" + file.size + " target: " + JSON.stringify(file.oss_upload_info))
                        }, {
                            api: "//uplb.115.com/3.0/sampleinitupload.php",
                            params: function(file) {
                                var key = "U";
                                switch (Number(file.aid)) {
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 9:
                                    key = "U_" + file.aid + "_" + (file.cid ? file.cid : 0);
                                    break;
                                case 999:
                                    var config = window.UPLOAD_CONFIG["999"];
                                    key = "Q_" + config.aid.replace("q_", "") + "_" + (file.cid ? file.cid : 0);
                                    break;
                                case "sharedFolder":
                                    key = file.cid;
                                    break
                                }
                                return {
                                    userid: USER_ID,
                                    filename: file.name,
                                    filesize: file.size,
                                    target: key
                                }
                            }
                        }));
                        _up.bind("Error", function(up, exp) {
                            Core.Debug.write("error --- code:" + exp.code + " msg:" + exp.message);
                            if (exp.file) {
                                exp.file.error = _ERROR[exp.code.toString()] ? String.format(_ERROR[exp.code.toString()], Util.File.ShowSize(UPLOAD_CONFIG_H5.size_limit, 0)) : exp.message;
                                exp.file.status = 4;
                                actions.error && actions.error(exp.file);
                                window.setTimeout(function() {
                                    _up.start()
                                }, 1)
                            }
                        });
                        _up.bind("UploadProgress", function(up, file) {
                            Core.Debug.write("up file-- id:" + file.id + " percent:" + file.percent);
                            actions.progress && actions.progress(file)
                        });
                        _up.bind("FileUploaded", function(up, file, res) {
                            var msg = "\n";
                            if (Core.CONFIG.DebugKey) {
                                for (var k in res) {
                                    msg += k + ":" + res[k] + "\n"
                                }
                            }
                            Core.Debug.write("uploaded file-- id:" + file.id + " \n" + msg + "\n");
                            Core.Debug.write(res.response);
                            if (Core.CONFIG.HTML5 && res.status != 200) {
                                file.error = _ERROR["-300"];
                                actions.error && actions.error(file);
                                _up.stop();
                                _up.removeFile(file);
                                return false
                            } else {
                                try {
                                    var data = eval("(" + res.response + ")");
                                    if (data.state) {
                                        actions.uploaded && actions.uploaded(file, data.data);
                                        var mode = oofUtil.getQueryParamByKey("mode", location.href);
                                        if (mode !== "shared_folder") {
                                            ctl.ReloadPage(file.aid, file.cid)
                                        }
                                        ctl.fileSuccess && ctl.fileSuccess(data)
                                    } else {
                                        file.error = data.message;
                                        if (data.code == 1001) {
                                            file.error = "不支持上传该文件"
                                        }
                                        if (data.code === 414) {
                                            file.failData = data.data
                                        }
                                        actions.error && actions.error(file)
                                    }
                                } catch (e) {
                                    file.error = "返回数据有误";
                                    actions.error && actions.error(file)
                                }
                            }
                        });
                        _up.bind("Dragover", function() {
                            actions.dragover && actions.dragover()
                        });
                        _up.bind("Dragleave", function() {
                            actions.dragleave && actions.dragleave()
                        });
                        _up.bind("Drop", function() {
                            actions.drop && actions.drop()
                        });
                        _up.init()
                    })
                }
            }
        }
    }
    )()
}
)(Core.Upload);
(function(ctl) {
    var _TCache = {
        initState: false,
        errorState: false,
        configTxt: "*.*",
        aid: 1,
        cid: 0,
        disable: "btn-disabled",
        FFIndexKey: 0
    };
    var _is115Browser = false;
    var _sizeUnit = {
        B: 0,
        KB: 1,
        MB: 2,
        GB: 3,
        TB: 4,
        PB: 5,
        EB: 6,
        ZB: 7,
        YB: 8,
        DB: 9,
        NB: 10
    };
    var getSizeByte = function(size) {
        var stxt = size.replace(/[0-9]|\./ig, "");
        var num = Number(size.replace(stxt, ""));
        var len = _sizeUnit[stxt.toUpperCase()];
        if (len) {
            for (var i = 0; i < len; i++) {
                num = num * 1024
            }
        }
        return Math.floor(num)
    };
    var _ProgressEvent = "OnProgressEvent" + (+new Date);
    var loadCab = function() {
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            $(document.body).append($('<object classid="' + Core.CONFIG.TUpClassID_NB_2014 + '" codebase="' + Core.CONFIG.TUpCodeBase_NB_2014 + '" id="' + Core.CONFIG.TUpDomId + '" style=" position:absolute; top:-99999px;" onerror="Core.Upload.TUpLoadError();"></object>'))
        }
    };
    var showDownload = function(isupdate) {
        loadCab();
        var url;
        var is_unix = false;
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            url = Core.CONFIG.TUpDownloadUrl_np_2014
        } else {
            if (Core.CONFIG.IsMac) {
                url = Core.CONFIG.TUpDownloadUrl_np_mac_2014
            } else {
                if (Core.CONFIG.IsWindowNT) {
                    url = Core.CONFIG.TUpDownloadUrl_np_2014
                } else {
                    is_unix = true;
                    url = Core.CONFIG.TUpDownloadUrl_np_unix_2014
                }
            }
        }
        if (Core.CONFIG.Webkit42) {
            Core.Message.Confirm({
                text: "请下载115电脑版高速稳定上传",
                content: "因浏览器内核限制无法上传超大文件，请下载115电脑版高速稳定上传。请点击确定按钮安装，<span style='color: #F60;'>安装完使用115电脑版上传</span>。",
                type: "war",
                confirm_link: "//pc.115.com",
                confirm_text: "立即下载"
            })
        } else {
            if (is_unix) {
                Core.Message.Alert({
                    text: isupdate ? "您需要更新大文件上传控件" : "您还未安装大文件上传控件",
                    content: "请点击确定按钮安装，<span style='color: #F60;'>安装完后需重启浏览器</span>。使用115上传控件支持最大上传115G的单个文件，并且还提供断点续传功能，方便您随时暂停或恢复上传。<br/><a href=\"" + Core.CONFIG.TUpDownloadUrl_np_unix_2014 + '">下载64位控件</a> <a href="' + Core.CONFIG.TUpDownloadUrl_np_unix_32_2014 + '">下载32位控件</a>',
                    type: "war"
                })
            } else {
                Core.Message.Confirm({
                    text: isupdate ? "您需要更新大文件上传控件" : "您还未安装大文件上传控件",
                    content: "请点击确定按钮安装，<span style='color: #F60;'>安装完后需重启浏览器</span>。使用115上传控件支持最大上传115G的单个文件，并且还提供断点续传功能，方便您随时暂停或恢复上传。",
                    type: "war",
                    confirm_link: url,
                    confirm_text: "立即下载"
                })
            }
        }
    };
    var tup = ctl.TUpload = (function() {
        var _UpList = {}
          , _ComList = {};
        var JsonToStr = function(o) {
            var arr = [];
            var fmt = function(s) {
                if (typeof s == "object" && s != null) {
                    return JsonToStr(s)
                }
                return /^(string|number)$/.test(typeof s) ? '"' + s + '"' : s
            };
            if (o.length != undefined) {
                for (var i in o) {
                    arr.push(fmt(o[i]))
                }
                return "[" + arr.join(",") + "]"
            } else {
                for (var i in o) {
                    arr.push('"' + i + '":' + fmt(o[i]))
                }
                return "{" + arr.join(",") + "}"
            }
        };
        setTimeout(function() {
            try {
                window.browserInterface && browserInterface.RemoveRegisterCallBack("OOF_UPLOAD_CALLBACK")
            } catch (e) {}
        }, 50);
        var progress = function(str) {
            Core.Debug.write(str);
            str = /msie/.test(navigator.userAgent.toLowerCase()) ? unescape(str.replace(/\\u/gi, "%u")) : str;
            var arr = str.split("|");
            if (Number(arr[0]) != 3) {
                var file = {
                    Action: arr[0],
                    PathKey: arr[1],
                    Key: Util.Text.sha1(arr[1]),
                    IsFolder: Number(arr[2]),
                    Status: arr[3],
                    TotalSize: Util.File.ShowSize(arr[4], Number(arr[2]) ? 0 : 2),
                    TransferSize: Util.File.ShowSize(arr[5], Number(arr[2]) ? 0 : 2),
                    Name: Core.CONFIG.IsMac ? arr[6].replace(/=1_k-1-c_5=/g, "|") : arr[6],
                    Path: arr[7],
                    Speed: Util.File.ShowSize(arr[8], Number(arr[2]) ? 0 : 2),
                    LeftTime: arr[9],
                    UploadPercent: arr[10],
                    HashPercent: arr[11],
                    ErrorTips: arr[12],
                    Target: arr[13],
                    IsSecond: arr[14],
                    ErrorTime: arr[15]
                };
                if (arr.length > 16) {
                    file.FileTotal = arr[16];
                    file.DealCount = arr[17]
                }
                file.ico = Number(file.IsFolder) ? "folder" : "file";
                var fileInfo = _UpList[file.Key] || {};
                fileInfo.id = file.Key;
                fileInfo.up_id = file.Key;
                fileInfo.progress = file.UploadPercent;
                fileInfo.name = file.Name;
                fileInfo.speed = file.Speed;
                fileInfo.speed_str = "(" + file.Speed + "/S)";
                fileInfo.is_uploading = 0;
                fileInfo.path = file.Path;
                fileInfo.error = file.ErrorTips;
                fileInfo.valid_up_bytes = file.TotalSize;
                fileInfo.size = getSizeByte(file.TotalSize);
                fileInfo.size_str = file.TotalSize;
                fileInfo.up_type = 2;
                fileInfo.offset_size = file.TransferSize;
                fileInfo.complete = getSizeByte(file.TransferSize);
                fileInfo.file_total = file.FileTotal;
                fileInfo.deal_count = file.DealCount;
                var target = file.Target;
                if (fileInfo.error == "空间不足!立即扩容") {
                    fileInfo.error = '空间不足！<a href="http://vip.115.com" target="_blank" style="color: #F60;">立即扩容</a>'
                }
                if (fileInfo.error == "单文件过大!立即升级") {
                    fileInfo.error = '单文件过大！<a href="http://vip.115.com" target="_blank" style="color: #F60;">立即升级</a>'
                }
                fileInfo.aid = 1;
                fileInfo.cid = 0;
                if (target) {
                    var targetArr = target.split("_");
                    if (targetArr.length >= 2) {
                        fileInfo.aid = targetArr[1]
                    }
                    if (targetArr.length >= 3) {
                        fileInfo.cid = targetArr[2]
                    }
                }
                if (file.IsFolder) {
                    fileInfo.is_dir = 1;
                    fileInfo.size_str = "文件夹";
                    fileInfo.hash_percent = file.HashPercent;
                    if (Number(file.FileTotal)) {
                        fileInfo.size_str = "共" + file.FileTotal + "个文件"
                    }
                }
                switch (Number(file.Action)) {
                case 1:
                case 2:
                    if (Number(file.Action) == 1) {
                        _UpList[fileInfo.id] = fileInfo;
                        doCommand("add", fileInfo)
                    }
                    var fileStTxt = {
                        "1": "等待上传",
                        "2": (file.IsFolder ? "解析文件夹(" + file.HashPercent + "个文件)" : "解析中:" + file.HashPercent),
                        "3": "建立连接",
                        "4": "上传",
                        "5": "暂停",
                        "6": "已删除",
                        "7": "上传错误",
                        "8": "上传完成",
                        "10": "待续传",
                        "11": "暂停中"
                    };
                    fileInfo.status = 4;
                    fileInfo.is_uploading = 0;
                    var txt = fileStTxt[file.Status];
                    doCommand("msg", fileInfo, txt, 0);
                    doCommand("ctl_button", fileInfo, false, true);
                    fileInfo.err = 0;
                    switch (Number(file.Status)) {
                    case 7:
                        fileInfo.err = 1;
                        doCommand("error", fileInfo, fileInfo.error);
                        doCommand("ctl_button", fileInfo, true, false);
                        fileInfo.status = 7;
                        break;
                    case 4:
                        fileInfo.is_uploading = 1;
                        doCommand("progress", fileInfo);
                        break;
                    case 8:
                        fileInfo.end_time = new Date().getTime();
                        fileInfo.is_uploading = 0;
                        fileInfo.checking = 1;
                        fileInfo.status = 9;
                        doCommand("success", fileInfo);
                        var reAid = fileInfo.aid
                          , reCid = fileInfo.cid;
                        window.setTimeout(function() {
                            fileInfo.checking = 0;
                            doCommand("success", fileInfo);
                            if (_UpList[fileInfo.id]) {
                                _ComList[fileInfo.id] = _UpList[fileInfo.id];
                                delete _UpList[fileInfo.id]
                            }
                            try {
                                doCommand("reloadpage", reAid, reCid)
                            } catch (e) {}
                        }, 1000);
                        break;
                    case 5:
                        doCommand("ctl_button", fileInfo, true, false);
                        break;
                    case 10:
                        doCommand("ctl_button", fileInfo, true, false);
                        doCommand("msg", fileInfo, "暂停", 0);
                        break
                    }
                    break;
                case 3:
                    doCommand("delete_file", fileInfo);
                    if (_UpList[fileInfo.id]) {
                        delete _UpList[fileInfo.id]
                    }
                    break
                }
            } else {
                var file = {
                    Action: arr[0],
                    PathKey: arr[1],
                    Key: Util.Text.sha1(arr[1])
                };
                var fileInfo = _UpList[file.Key] || {};
                fileInfo.id = file.Key;
                doCommand("delete_file", fileInfo);
                if (_UpList[fileInfo.id]) {
                    delete _UpList[fileInfo.id]
                }
            }
        };
        var init = function(config) {
            if (window.IS_HIDDEN_MODE) {
                return
            }
            if (!_TCache.initState) {
                if (_is115Browser) {
                    _TCache.Uploader = window.uploadInterface
                } else {
                    var up = document.getElementById(Core.CONFIG.TUpDomId);
                    _TCache.Uploader = up
                }
                if (_TCache.Uploader) {
                    UPLOAD_CONFIG_NEW.target = "U_1_0";
                    UPLOAD_CONFIG_NEW.use_type = 2;
                    UPLOAD_CONFIG_NEW.file_range = {
                        "0": "0-0"
                    };
                    UPLOAD_CONFIG_NEW.type_limit = [];
                    UPLOAD_CONFIG_NEW.user_id = USER_ID;
                    var configStr = JsonToStr(UPLOAD_CONFIG_NEW);
                    if (/msie/.test(navigator.userAgent.toLowerCase())) {
                        _TCache.Uploader.attachEvent("ProgressEvent", progress);
                        _TCache.Uploader.Initialize(configStr)
                    } else {
                        if (_is115Browser) {
                            window.OOF_UPLOAD_CALLBACK = progress;
                            window.browserInterface && browserInterface.AddRegisterCallBack("OOF_UPLOAD_CALLBACK");
                            _TCache.Uploader.Initialize(configStr)
                        } else {
                            window[_ProgressEvent] = progress;
                            _TCache.Uploader.Initialize(configStr, _ProgressEvent)
                        }
                    }
                    try {
                        if ("SetTaskCount"in _TCache.Uploader) {
                            _TCache.Uploader.SetTaskCount(window.MAIN_UPTASK_COUNT ? window.MAIN_UPTASK_COUNT : 3)
                        }
                    } catch (e) {}
                    _TCache.initState = true
                }
            }
        };
        var select = function() {
            if (_TCache.errorState) {
                showDownload()
            } else {
                if (!_is115Browser) {
                    var v = _TCache.Uploader.GetPluginVersion();
                    _TCache.ocx_version = v;
                    var version = Core.CONFIG.TUpUnixVersion2014;
                    if (Core.CONFIG.IsWindowNT) {
                        version = Core.CONFIG.TUpFFVersion2014
                    }
                    if (Core.CONFIG.IsMac) {
                        version = Core.CONFIG.TUpMacVersion2014
                    }
                    Core.Debug.write("要求版本: " + version + " 控件版本:" + v);
                    if (USER_ID == 61194148) {} else {
                        if (v.indexOf(version) == -1) {
                            Core.MinMessage.Show({
                                text: "您的极速上传控件需要更新才能使用! ",
                                type: "war",
                                timeout: Core.CONFIG.MsgTimeout
                            });
                            showDownload(true);
                            return
                        }
                    }
                }
                var target = "U_" + _TCache.aid + "_" + _TCache.cid;
                Core.Debug.write("select target: " + target);
                tup.SetISPType(Core.CONFIG.TUpSp);
                window.setTimeout(function() {
                    _TCache.Uploader.SelectFileUpload(target)
                }, 100)
            }
        };
        var doCommand = function(funName) {
            if (tup.Actions && tup.Actions[funName]) {
                var arg = arguments;
                var params = [];
                if (arg.length > 1) {
                    for (var i = 1, len = arg.length; i < len; i++) {
                        params.push("arg[" + i + "]")
                    }
                }
                eval("var res = tup.Actions." + funName + "(" + params.join(",") + ")");
                return res
            }
        };
        var installError = function() {
            _TCache.errorState = true;
            if (document.getElementById(Core.CONFIG.TUpDomId)) {
                document.body.removeChild(document.getElementById(Core.CONFIG.TUpDomId))
            }
        };
        return {
            Actions: null,
            Select: function() {
                select()
            },
            SetConfig: function(aid, cid) {
                if (aid == undefined) {
                    aid = 1;
                    cid = 0
                }
                if (cid.toString().indexOf("_0") != -1) {
                    cid = 0
                }
                var key = aid.toString();
                var config = ctl.GetCache().config[key];
                _TCache.aid = aid;
                _TCache.cid = cid;
                try {
                    init(config)
                } catch (e) {}
            },
            Delete: function(file) {
                if (_UpList[file.id]) {
                    _TCache.Uploader.Delete(file.path)
                } else {
                    if (_ComList[file.id]) {
                        _TCache.Uploader.Delete(file.path);
                        delete _ComList[file.id]
                    }
                }
            },
            Pause: function(file) {
                _TCache.Uploader.Stop(file.path)
            },
            Reupload: function(file) {
                _TCache.Uploader.Upload(file.path, "")
            },
            Error: function() {
                installError()
            },
            isStart: function() {
                return _TCache.initState
            },
            isInstall: function() {
                if (window.IS_HIDDEN_MODE) {
                    return false
                }
                return !_TCache.errorState
            },
            SetISPType: function(type) {
                if (!_TCache.errorState && _TCache.Uploader && ("SetISPType"in _TCache.Uploader)) {
                    _TCache.Uploader.SetISPType(Number(type))
                }
            },
            Install: function() {
                if (/msie/.test(navigator.userAgent.toLowerCase())) {
                    if (!document.getElementById(Core.CONFIG.TUpDomId)) {
                        var object = $('<object classid="' + Core.CONFIG.TUpClassID_NB_2014 + '" id="' + Core.CONFIG.TUpDomId + '" style="position:absolute; top:-99999px;" onerror="Core.Upload.TUpload.Error();"></object>');
                        $(document.body).append(object)
                    }
                } else {
                    if (window.uploadInterface) {
                        _is115Browser = true;
                        (function() {
                            var _reloadTimer;
                            window.RefreshUploadPage = function(cid) {
                                if (_reloadTimer) {
                                    window.clearTimeout(_reloadTimer)
                                }
                                _reloadTimer = window.setTimeout(function() {
                                    if (Core.FileConfig.DataAPI) {
                                        Core.FileConfig.DataAPI.Reload(1, cid)
                                    }
                                    Core.SpaceData.Sync();
                                    if (_reloadTimer) {
                                        window.clearTimeout(_reloadTimer)
                                    }
                                }, 500)
                            }
                        }
                        )()
                    }
                    if (!_is115Browser) {
                        if (Core.CONFIG.IsWindows) {
                            if (navigator.plugins && navigator.plugins.length > 0) {
                                var p = false;
                                for (var i = 0; i < navigator.plugins.length; i++) {
                                    if (navigator.plugins[i] && navigator.plugins[i][0] && navigator.plugins[i][0]["type"] == "application/x-115uploadplugin") {
                                        p = true;
                                        break
                                    }
                                }
                                if (p) {
                                    var object = $('<embed id="' + Core.CONFIG.TUpDomId + '" type="application/x-115uploadplugin" width="0" height="0" style="position:absolute; top:-99999px;" />');
                                    $(document.body).append(object)
                                } else {
                                    installError()
                                }
                            } else {
                                installError()
                            }
                        } else {
                            installError()
                        }
                    }
                }
                $(document).bind("keyup", function(e) {
                    if (e.ctrlKey && e.shiftKey && e.keyCode == 220) {
                        Core.CONFIG.TUpDebugTime++;
                        if (Core.CONFIG.TUpDebugTime > 5) {
                            if (!Core.CONFIG.TUpDebugKey) {
                                Core.CONFIG.TUpDebugKey = true;
                                Core.MinMessage.Show({
                                    text: "断点续传调试已开启",
                                    type: "suc",
                                    timeout: 2000
                                })
                            }
                        }
                    }
                })
            },
            ReuploadByPickCode: function(pick_code) {
                if (_TCache.errorState) {
                    showDownload();
                    return
                }
            },
            DeleteByPickCode: function(pick_code) {},
            ShowDownload: function() {
                showDownload()
            },
            isInit: function() {
                return _TCache.initState
            }
        }
    }
    )()
}
)(Core.Upload);
(function(ctl) {
    var _TCache = {
        initState: false,
        errorState: false,
        configTxt: "*.*",
        aid: 1,
        cid: 0,
        disable: "btn-disabled",
        FFIndexKey: 0
    };
    var _is115Browser = false;
    var _sizeUnit = {
        B: 0,
        KB: 1,
        MB: 2,
        GB: 3,
        TB: 4,
        PB: 5,
        EB: 6,
        ZB: 7,
        YB: 8,
        DB: 9,
        NB: 10
    };
    var getSizeByte = function(size) {
        var stxt = size.replace(/[0-9]|\./ig, "");
        var num = Number(size.replace(stxt, ""));
        var len = _sizeUnit[stxt.toUpperCase()];
        if (len) {
            for (var i = 0; i < len; i++) {
                num = num * 1024
            }
        }
        return Math.floor(num)
    };
    var tup = ctl.AUpload = (function() {
        var _ComList = {};
        var _uploadWin, _UploadConfig, _UpdateCache = {}, _UpList = {}, _UpTasks = {}, _Actions, _UpDownloadTask, _UpGetError = false;
        setTimeout(function() {
            Util.log("115浏览器状态");
            try {
                _UpDownloadTask = window.downloadInterface;
                _UpDownloadTask.RemoveRegisterCallBack("OOF_UPLOAD_UPDATE_CALLBACK");
                _UpDownloadTask.RemoveRegisterCallBack("OOF_UPLOAD_LOAD_BATCH_CALLBACK");
                _UpDownloadTask.RemoveRegisterCallBack("OOF_UPLOAD_DELETE_BATCH_CALLBACK");
                _UpDownloadTask.RemoveRegisterCallBack("OOF_UPLOAD_START_ALL_FINISHED");
                _UpDownloadTask.RemoveRegisterCallBack("OOF_UPLOAD_STOP_ALL_FINISHED")
            } catch (e) {}
        }, 200);
        function hasMargeFileUpload(file) {
            var setting = {
                title: "使用该功能，请升级VIP会员",
                confirm_text: "升级VIP会员",
                confirm_link: "//vip.115.com/?vip_type=year"
            };
            $.ajax({
                url: "//webapi.115.com/user/user_rights",
                data: {
                    type: 1
                },
                type: "GET",
                dataType: "JSON",
                success: function(r) {
                    if (r.state) {
                        if (r.data.count) {
                            setting = {
                                title: '使用该功能，请升级VIP会员<br/>或使用"大文件上传"兑换券',
                                confirm_text: "使用兑换券(" + r.data.count + ")",
                                confirm_link: "javascript:;",
                                confirm_text2: "升级VIP会员",
                                confirm_link2: "//vip.115.com/?vip_type=year",
                                btns: 2,
                                confirm_callback: function(_this) {
                                    $.ajax({
                                        url: "//webapi.115.com/user/user_rights",
                                        data: {
                                            type: 1
                                        },
                                        type: "POST",
                                        dataType: "JSON",
                                        success: function(r) {
                                            if (r.state) {
                                                $.successTip("使用成功");
                                                setTimeout(function() {
                                                    top.window._SHOWVIPDIALOG_.Hide();
                                                    top.Core.Upload.AUpload.Reupload(file)
                                                }, 1000)
                                            } else {
                                                $.errorTip("使用失败")
                                            }
                                        }
                                    })
                                }
                            }
                        }
                        top.window._SHOWVIPDIALOG_.Show(setting)
                    } else {
                        $.alertTip(r.message || "网络错误，请刷新重试")
                    }
                }
            })
        }
        var progress = function(data, taskupload) {
            if (typeof data.upload_percent != "string") {
                data.upload_percent += ""
            }
            data.upload_percent = data.upload_percent.replace("%", "") * 1;
            data.speed = data.speed * 1;
            var file = $.extend({}, data);
            file.PathKey = file.path;
            file.Key = file.task_id;
            file.IsFolder = file.is_folder;
            file.Status = file.status;
            file.TotalSize = Util.File.ShowSize(file.total_size * 1, 2);
            file.TransferSize = Util.File.ShowSize(file.transfer_size * 1, 2);
            file.Name = file.name;
            file.Path = file.path;
            file.Speed = Util.File.ShowSize(file.speed, 2);
            file.speed = file.speed;
            file.LeftTime = file.left_time;
            file.UploadPercent = file.upload_percent;
            file.HashPercent = file.hash_percent;
            file.ErrorTips = file.error_tips;
            file.loaded = file.transfer_size * 1;
            file.progress = file.UploadPercent;
            file.FileTotal = file.file_count;
            file.ico = Number(file.IsFolder) ? "folder" : "file";
            var fileInfo = _UpList[file.Key] || {};
            fileInfo.id = file.Key;
            fileInfo.status = file.status;
            fileInfo.up_id = file.Key;
            fileInfo.progress = file.UploadPercent;
            fileInfo.percent = file.UploadPercent;
            fileInfo.name = file.Name;
            fileInfo.speed = file.speed;
            fileInfo.speed_str = "(" + file.Speed + "/S)";
            fileInfo.is_uploading = 0;
            fileInfo.path = file.Path;
            fileInfo.error = file.ErrorTips;
            fileInfo.valid_up_bytes = file.TotalSize;
            fileInfo.file_count = file.file_count ? file.file_count : 0;
            fileInfo.upload_count = file.upload_count;
            fileInfo.size = getSizeByte(file.TotalSize);
            fileInfo.size_str = file.TotalSize;
            fileInfo.up_type = 3;
            fileInfo.offset_size = file.TransferSize;
            fileInfo.complete = getSizeByte(file.TransferSize);
            fileInfo.uploading_index = file.uploading_index;
            fileInfo.left_time = file.left_time;
            fileInfo.type = file.type;
            var target = file.cid;
            if (fileInfo.error == "空间不足!立即扩容") {
                fileInfo.error = '空间不足！<a href="http://vip.115.com" target="_blank" style="color: #F60;">立即扩容</a>'
            }
            if (fileInfo.error == "单文件过大!立即升级") {
                fileInfo.error = '单文件过大！<a href="http://vip.115.com" target="_blank" style="color: #F60;">立即升级</a>'
            }
            if (fileInfo.error == "非VIP用户上传单个文件不能超过5120MB" || fileInfo.error == "单个文件大于5GB，不支持上传！" || (fileInfo.error.indexOf("大于5GB") > -1) || (fileInfo.error.indexOf("文件大小超出单文件上传最大限制") > -1 && file.TotalSize < 115 * 1024 * 1024 * 1024) || fileInfo.error == "上传失败！无可用大文件上传权益劵") {
                if (!top.window._SHOWVIPDIALOG_) {
                    top.Util.Load.JS("//cdnres.115.com/site/static/plug/vip_pay/vip.pay.js?_vh=4313d84_64&v=1674116479111", hasMargeFileUpload(fileInfo))
                } else {
                    hasMargeFileUpload(fileInfo)
                }
            }
            fileInfo.aid = 1;
            fileInfo.cid = 0;
            if (target) {
                var targetArr = target.split("_");
                if (targetArr.length >= 2) {
                    fileInfo.aid = targetArr[1]
                }
                if (targetArr.length >= 3) {
                    fileInfo.cid = targetArr[2]
                }
            }
            if (file.IsFolder) {
                fileInfo.is_dir = 1;
                fileInfo.size_str = "文件夹";
                fileInfo.hash_percent = file.HashPercent;
                if (Number(file.FileTotal)) {
                    fileInfo.size_str = "共" + file.FileTotal + "个文件"
                }
            }
            if (!_UpList[fileInfo.id]) {
                _UpList[fileInfo.id] = fileInfo;
                doCommand("add", fileInfo)
            }
            switch (Number(file.status)) {
            case 1:
            case 2:
                var fileStTxt = {
                    "1": "等待上传",
                    "2": (file.IsFolder ? "展开文件夹(" + file.HashPercent + "个文件)" : "解析中:" + file.HashPercent),
                    "3": "建立连接",
                    "4": "上传",
                    "5": "暂停",
                    "6": "已删除",
                    "7": "上传错误",
                    "8": "上传完成",
                    "10": "待续传"
                };
                fileInfo.is_uploading = 0;
                var txt = fileStTxt[file.status];
                doCommand("progress", fileInfo);
                doCommand("ctl_button", fileInfo, false, true);
                doCommand("msg", fileInfo, txt);
                fileInfo.err = 0;
                break;
            case 3:
            case 4:
                fileInfo.is_uploading = 1;
                doCommand("progress", fileInfo);
                doCommand("ctl_button", fileInfo, false, true);
                break;
            case 5:
                if (!_UpList[fileInfo.id]) {
                    _UpList[fileInfo.id] = fileInfo;
                    doCommand("add", fileInfo)
                }
                doCommand("ctl_button", fileInfo, true, false);
                doCommand("msg", fileInfo, "暂停");
                doCommand("count_text");
                break;
            case 6:
                doCommand("delete_file", fileInfo);
                break;
            case 7:
                fileInfo.err = 1;
                doCommand("error", fileInfo, fileInfo.error);
                doCommand("ctl_button", fileInfo, true, false);
                doCommand("count_text");
                break;
            case 8:
                fileInfo.end_time = new Date().getTime();
                fileInfo.is_uploading = 0;
                if (taskupload) {
                    fileInfo.checking = 0
                } else {
                    fileInfo.checking = 1
                }
                doCommand("ctl_button", fileInfo, true, true);
                doCommand("success", fileInfo);
                doCommand("count_text");
                var reAid = fileInfo.aid
                  , reCid = fileInfo.cid;
                window.setTimeout(function() {
                    fileInfo.checking = 0;
                    doCommand("success", fileInfo);
                    if (_UpList[fileInfo.id]) {
                        delete _UpList[fileInfo.id]
                    }
                    try {
                        doCommand("reloadpage", fileInfo)
                    } catch (e) {}
                }, 1000);
                break;
            case 10:
                doCommand("ctl_button", fileInfo, true, false);
                doCommand("progress", fileInfo);
                break
            }
        };
        (function() {
            try {
                var _reloadTimer;
                window.RefreshUploadPage = function(cid) {
                    if (_reloadTimer) {
                        window.clearTimeout(_reloadTimer)
                    }
                    _reloadTimer = window.setTimeout(function() {
                        if (Core.FileConfig.DataAPI) {
                            Core.FileConfig.DataAPI.Reload(1, cid)
                        }
                        Core.SpaceData.Sync();
                        if (_reloadTimer) {
                            window.clearTimeout(_reloadTimer)
                        }
                    }, 500)
                }
            } catch (e) {}
        }
        )();
        window.OOF_UPLOAD_LOAD_BATCH_CALLBACK = function(batch_info) {
            batch_info = decodeURIComponent(batch_info);
            var info = JSON.parse(batch_info);
            if (!info || !info.data || info.data.length < 1) {
                return
            }
            var data = info.data;
            for (var i = 0, len = data.length; i < len; i++) {
                var d = data[i];
                if (_UpTasks[d] || d.type != 1) {
                    continue
                }
                progress(d, true);
                if (!_UpTasks[d.task_id]) {
                    _UpTasks[d.task_id] = d
                }
            }
        }
        ;
        window.OOF_UPLOAD_UPDATE_CALLBACK = function(task_info) {
            task_info = decodeURIComponent(task_info);
            var task = JSON.parse(task_info);
            if (task && task.type == 1) {
                progress(task);
                _UpTasks[task.task_id] = task
            }
        }
        ;
        window.OOF_UPLOAD_GET_ERROR_LIST_CALLBACK = function(err_info) {
            if (!_UpGetError) {
                return
            }
            err_info = decodeURIComponent(err_info);
            var info = JSON.parse(err_info);
            if (info && info.type == 1 && info.err_info && info.err_info.length) {
                Core.SimpleFrameDG.Open("upload_error_list", "//cdnres.115.com/yun/assets/html/upload.error.list.html?v=1", {
                    title: "上传错误列表",
                    width: 760,
                    height: 350,
                    ready: function(win) {
                        var list = info.err_info;
                        var $body = $(win.document.body);
                        var tpl = $body.find("#js-tpl").html()
                          , arr = [];
                        for (var i = 0; i < list.length; i++) {
                            var d = list[i];
                            d.title = d.path.substring(d.path.lastIndexOf("/") + 1, d.path.length);
                            arr.push(String.formatmodel(tpl, d))
                        }
                        $body.find('[rel="list"]').html(arr.join(""));
                        $(win).on("keydown", function(e) {
                            if (e.keyCode == 27) {
                                Core.SimpleFrameDG.Close("upload_error_list");
                                return false
                            }
                        })
                    }
                })
            }
        }
        ;
        window.OOF_UPLOAD_DELETE_BATCH_CALLBACK = function(data) {
            data = decodeURIComponent(data);
            var info = JSON.parse(data);
            if (info && info.type == 1) {
                for (var i = 0, len = info.task_ids.length; i < len; i++) {
                    var id = info.task_ids[i];
                    if (_UpTasks[id]) {
                        _UpTasks[id]["id"] = id;
                        doCommand("delete_file", _UpTasks[id])
                    }
                }
            }
        }
        ;
        window.OOF_UPLOAD_START_ALL_FINISHED = function(data) {
            for (var i in _UpList) {
                var file = _UpTasks[i];
                if (file.type == data * 1) {
                    file.status = 4;
                    progress(file)
                }
            }
        }
        ;
        window.OOF_UPLOAD_STOP_ALL_FINISHED = function(data) {
            for (var i in _UpList) {
                var file = _UpTasks[i];
                if (file.type == data * 1) {
                    file.status = 5;
                    progress(file)
                }
            }
        }
        ;
        var _initStart = false;
        var select = function() {
            if (!_initStart) {
                _UpDownloadTask.AddRegisterCallBack("OOF_UPLOAD_LOAD_BATCH_CALLBACK");
                _UpDownloadTask.AddRegisterCallBack("OOF_UPLOAD_UPDATE_CALLBACK");
                _UpDownloadTask.AddRegisterCallBack("OOF_UPLOAD_GET_ERROR_LIST_CALLBACK");
                _UpDownloadTask.AddRegisterCallBack("OOF_UPLOAD_DELETE_BATCH_CALLBACK");
                _UpDownloadTask.AddRegisterCallBack("OOF_UPLOAD_START_ALL_FINISHED");
                _UpDownloadTask.AddRegisterCallBack("OOF_UPLOAD_STOP_ALL_FINISHED");
                Core.Update115.loadTask(1);
                _initStart = true
            }
            var param_json = encodeURI('{"type":1,"cid":"' + _TCache.cid + '","aid":"' + _TCache.aid + '"}');
            Core.Update115.uploadBySelecting(param_json)
        };
        var doCommand = function(funName) {
            if (tup.Actions && tup.Actions[funName]) {
                var arg = arguments;
                var params = [];
                if (arg.length > 1) {
                    for (var i = 1, len = arg.length; i < len; i++) {
                        params.push("arg[" + i + "]")
                    }
                }
                eval("var res = tup.Actions." + funName + "(" + params.join(",") + ")");
                return res
            }
        };
        var installError = function() {
            _TCache.errorState = true;
            if (document.getElementById(Core.CONFIG.TUpDomId)) {
                document.body.removeChild(document.getElementById(Core.CONFIG.TUpDomId))
            }
        };
        return {
            Actions: null,
            Select: function() {
                select()
            },
            SetConfig: function(aid, cid) {
                if (aid == undefined) {
                    aid = 1;
                    cid = 0
                }
                if (cid.toString().indexOf("_0") != -1) {
                    cid = 0
                }
                var key = aid.toString();
                var config = ctl.GetCache().config[key];
                _TCache.aid = aid;
                _TCache.cid = cid;
                try {
                    init(config)
                } catch (e) {}
            },
            Delete: function(file) {
                Core.Update115["delete"]('{"type":1,"task_ids":["' + file.id + '"]}');
                delete _UpList[file.id]
            },
            Pause: function(file) {
                Core.Update115.stop(1, file.id)
            },
            Reupload: function(file) {
                Core.Update115.start(1, file.id)
            },
            GetErrorList: function(id) {
                _UpGetError = true;
                Core.Update115.getErrorExtraInfo(1, id);
                setTimeout(function() {
                    _UpGetError = false
                }, 2000)
            },
            Error: function() {
                installError()
            },
            isStart: function() {
                return _TCache.initState
            },
            Install: function() {},
            ReuploadByPickCode: function(pick_code) {
                if (_TCache.errorState) {
                    showDownload();
                    return
                }
            },
            SetISPType: function(upsp) {
                Core.Update115.setISPType(upsp)
            },
            DeleteByPickCode: function(pick_code) {},
            ShowDownload: function() {
                showDownload()
            },
            isInit: function() {
                return _TCache.initState
            }
        }
    }
    )()
}
)(Core.Upload);
(function(ctl) {
    var WebkitAgent = 42
      , Brow = window.uploadInterface ? 1 : -1;
    Core.CONFIG.Webkit42 = false;
    if (Brow == -1) {
        Core.CONFIG.Webkit42 = true
    }
    ctl.ReadyUI = function(actions) {
        if (!actions) {
            actions = {}
        }
        var _MinForm = new (function() {
            var _self = this;
            var _content;
            var bindEvents = function() {
                _content.find("[rel='max']").on("click", function() {
                    _MinForm.Close();
                    ui.Open();
                    return false
                })
            };
            var _openState = false;
            this.Open = function() {
                _openState = true
            }
            ;
            this.Close = function() {
                _openState = false;
                if (_content) {
                    _content.hide()
                }
            }
            ;
            this.Progress = function(obj) {
                if (!ui.IsOpen && obj) {
                    if (!_content) {
                        _content = $('<div class="upload-min" style="position:fixed;"><span rel="pro_text">正在上传，已完成15%</span><a href="javascript:;" rel="max" class="maximize">最大化</a></div>');
                        $(document.body).append(_content);
                        bindEvents()
                    }
                    if (!_openState) {
                        _self.Open();
                        _content.show()
                    }
                    _content.find("[rel='pro_text']").html(obj.text)
                } else {
                    if (_openState) {
                        _self.Close()
                    }
                }
            }
        }
        )();
        var ui = new (function() {
            var _self = this
              , _datalist = {}
              , _loadState = false
              , _isClose = true
              , _isnofile = true
              , _initState = false;
            var _installBtn = "";
            var _installBtn = '<a href="javascript:;" rel="js_up_install">点击安装</a>';
            if (/msie/.test(navigator.userAgent.toLowerCase())) {
                _installBtn = '<a href="//cdnres.115.com/site/static/plug/install2014_help/install_step1.html" rel="js_up_install_old" target="_blank">点击安装</a>'
            }
            var _content = $('<div><div class="hint-box" style="display:none;margin-bottom: 2px;" rel="js_hint_msg_box">您现在使用的是普通上传模式，建议您安装“高速上传控件”提高上传速度！ ' + _installBtn + '</div><div class="hint-box" style="padding: 10px 8px;">警告：严禁存储、处理、传输、发布任何涉密、色情、暴力、侵权等违法违规信息。<a target="_blank" href="http://115.com/?ct=report">并积极配合开展“扫黄打非”净网行动</a></div><div class="upload-contents" rel="nofile"><div class="drop-box" style=" cursor:pointer;"><div class="drop-text" rel="drop_text"></div><div class="btn-wrap"><a href="javascript:;" class="button" rel="add_btn"><i class="icon-button ib-add"></i><span>添加文件</span></a></div></div><div class="upload-text" rel="upload_bottom_text"></div></div><div class="upload-box-list" rel="hasfile" style="height:331px;display:none;"><ul rel="list"></ul></div><div class="upload-status" rel="hasfile" style="display:none;"><a href="javascript:;" class="button" rel="add_btn"><i class="icon-button ib-add"></i><span>添加文件</span></a><span rel="msg"></span> <a href="javascript:;" rel="clean" style="float: right;">清空已完成任务</a></div><div rel="up_btn" id="' + ctl.CONFIG.UploadBox + '" style="position:absolute; top:40px; left:80px; width:' + ctl.CONFIG.WIDTH + "px; height:" + ctl.CONFIG.HEIGHT + 'px; z-index: 999; cursor:pointer;"><span id="' + ctl.CONFIG.FUploadBtn + '" style="position:absolute; display:inline-block; width:' + ctl.CONFIG.WIDTH + "px; height:" + ctl.CONFIG.HEIGHT + 'px;"><a href="javascript:;" id="' + ctl.CONFIG.UploadBtn + '" style="position:absolute; display:inline-block; width:' + ctl.CONFIG.WIDTH + "px; height:" + ctl.CONFIG.HEIGHT + 'px;">&nbsp;</a></span><a href="javascript:;" id="' + ctl.CONFIG.TUpDomId + '" style="position:absolute; display:none;background:url(about:blank);text-decoration:none; width:' + ctl.CONFIG.WIDTH + "px; height:" + ctl.CONFIG.HEIGHT + 'px;">&nbsp;&nbsp;</a></div></div>');
            var domlist = _content.find("[rel='list']");
            var msgBox = _content.find("[rel='msg']");
            var checkList = function() {
                var list = domlist.children();
                var nofile = _content.find('[rel="nofile"]');
                var hasfile = _content.find('[rel="hasfile"]');
                var upBtn = _content.find("[rel='up_btn']");
                if (list.length) {
                    nofile.hide();
                    hasfile.show();
                    _self.warp.find('[rel="up_limit_txt"]').show();
                    var addBtn = _content.find("[add_btn]");
                    upBtn.css({
                        left: "21px",
                        bottom: "18px",
                        top: ""
                    })
                } else {
                    nofile.show();
                    hasfile.hide();
                    _self.warp.find('[rel="up_limit_txt"]').hide()
                }
            };
            var bindEvent = function() {
                var _hintMsgBox = _content.find('[rel="js_hint_msg_box"]');
                var addTop = 0;
                if (!ctl.TUpload.isInstall()) {
                    _hintMsgBox.show();
                    if (window.IS_HIDDEN_MODE) {
                        _hintMsgBox.hide()
                    }
                    _hintMsgBox.find('[rel="js_up_install"]').on("click", function() {
                        ctl.TUpload.ShowDownload();
                        return false
                    });
                    addTop += 30
                }
                if (Core.CONFIG.Webkit42) {
                    addTop += 38;
                    _hintMsgBox.show().html('您现在使用的是普通上传模式，建议您安装“115电脑版”提高上传速度！<a href="http://pc.115.com" target="_blank">点击安装</a>')
                }
                addTop += 38;
                var nofileBox = _content.find("[rel='nofile']");
                var upBtn = _content.find("[rel='up_btn']");
                var dropBox = nofileBox.find(".drop-box");
                dropBox.on("mousemove", function(e) {
                    if (_isnofile) {
                        var x = e.pageX
                          , y = e.pageY;
                        upBtn.css({
                            left: 0,
                            top: 0,
                            bottom: ""
                        }).offset({
                            left: x - 10,
                            top: y - 10
                        })
                    }
                });
                _content.find('[rel="clean"]').on("click", function() {
                    domlist.find('[success="1"]').each(function() {
                        var el = $(this);
                        var fileId = el.attr("file_id");
                        if (_datalist[fileId]) {
                            var file = _datalist[fileId].file;
                            delete _datalist[el.attr("file_id")];
                            actions["delete"] && actions["delete"](file);
                            UpdatePopup(file, null, "delete")
                        }
                        el.empty().remove()
                    });
                    checkList();
                    return false
                })
            };
            var _fileTemp = '<li file_id="{id}" aid="{aid}" cid="{cid}"><i class="file-small" rel="ico"></i><span class="file-name" title="{name}" style="width: 350px;">{name_cut} <i rel="size_str">- {size_str}</i></span><span class="file-status" rel="status" style="width: 265px;font-size: 14px;">等待上传</span><em rel="op"></em><b rel="progress"></b></li>';
            var getBtn = function(obj) {
                var op = obj.dom.find("[rel='op']");
                var btn = op.find("." + obj.className);
                if (!op.find("." + obj.className).length) {
                    btn = $('<a href="javascript:;" class="ico-opt ' + obj.className + '" style="margin-left:5px;">' + obj.text + "</a>");
                    op.prepend(btn);
                    if (obj.hide) {
                        btn.hide()
                    }
                    btn.on("click", obj.callback)
                }
                return btn
            };
            Util.Style.IncludeCss("js_upload_dialog_css", STATIC_DIR + "/plug/upload/css/upload.css?v=4");
            var checkUpEngine = function(UpEngine, TUpSp) {
                if (_setting_dom) {
                    var updom = _setting_dom;
                    updom.find("i.icon").hide();
                    var itemDom;
                    var uploadBottomText = _content.find('[rel="upload_bottom_text"]');
                    uploadBottomText.html('您没看错，<span style="color:#f60">我们支持高达' + Util.File.ShowSize(ctl.GetCache().config["1"].upload_size_limit, 0) + '超大单个文件上传！</span><a href="http://pc.115.com" target="_blank">安装115电脑版高速稳定上传下载！</a>');
                    if (window.IS_HIDDEN_MODE || Core.Update115) {
                        uploadBottomText.hide()
                    }
                    var drop_text = "";
                    switch (UpEngine) {
                    case 0:
                        itemDom = updom.find("[val='flash'] i");
                        if (Core.CONFIG.HTML5) {
                            drop_text = "把文件拖到这里，即可上传"
                        } else {
                            drop_text = "点击选择文件，即可上传"
                        }
                        break;
                    case 1:
                        drop_text = "点击选择文件，即可上传";
                        if (Number(TUpSp) == 3) {
                            itemDom = updom.find("[val='ocx3'] i")
                        } else {
                            if (Number(TUpSp) == 2) {
                                itemDom = updom.find("[val='ocx2'] i")
                            } else {
                                if (Number(TUpSp) == 4) {
                                    itemDom = updom.find("[val='ocx4'] i")
                                } else {
                                    itemDom = updom.find("[val='ocx1'] i")
                                }
                            }
                        }
                        break
                    }
                    _content.find('[rel="drop_text"]').html(drop_text);
                    if (itemDom) {
                        itemDom.show()
                    }
                    _setting_dom.hide();
                    var titleSpan = _self.warp.find('[data-title="upload_type"] span');
                    titleSpan.html(itemDom.parent().find("span").html());
                    var fupBtn = _content.find("#" + ctl.CONFIG.FUploadBtn);
                    var tupBtn = _content.find("#" + ctl.CONFIG.TUpDomId);
                    if (UpEngine) {
                        fupBtn.css({
                            top: -99999
                        });
                        tupBtn.show()
                    } else {
                        fupBtn.css({
                            top: ""
                        });
                        tupBtn.hide()
                    }
                }
            };
            var UpdatePopupCache = {};
            var UpdatePopup = function(file, data, action, isInit) {
                Core.TaskDownload && Core.TaskDownload.Updata(file, data, action, actions);
                switch (action) {
                case "update":
                    if (!UpdatePopupCache[file.id]) {
                        UpdatePopupCache[file.id] = file;
                        UpdatePopup(file, data, "add")
                    }
                    var iserr = false;
                    Core.FileConfig.DataAPI && Core.FileConfig.DataAPI.UpdateTaskBtn(file.id, file.percent, "upload");
                    if (file.up_type == 1) {
                        if (file.error) {
                            statusStr = file.error ? file.error : "上传失败";
                            iserr = true
                        } else {
                            if (file.status == 4) {
                                iserr = true
                            }
                        }
                    } else {
                        if (file.up_type == 3) {
                            if (file.status == 7) {
                                iserr = true
                            }
                        }
                    }
                    if (iserr) {
                        Core.FileConfig.DataAPI && Core.FileConfig.DataAPI.UpdateTaskBtn(file.id, 100, "upload")
                    }
                    break;
                case "delete":
                    if (file.percent != 100) {
                        Core.FileConfig.DataAPI && Core.FileConfig.DataAPI.UpdateTaskBtn(file.id, 100, "upload")
                    }
                    break
                }
                return
            };
            var _setting_dom;
            var uploadSourceConfig;
            var _top = Util.Override(Core.WindowBase, _self, {
                IsOpen: false,
                Initial: function() {
                    _isClose = false;
                    var $batchAppeal = $('<div class="header-side">\n            <a href="javascript:;" class="button btn-light"><i class="ibco-more"></i></a>\n            <div class="context-menu">\n                <div class="cell">\n                    <a rel="batchAppeal" href="javascript:;"><span>批量申诉</span></a>\n                </div>\n            </div>\n        </div>');
                    $batchAppeal.insertBefore(_self.warp.find("[rel=base_title]").find(".dialog-handle"));
                    $batchAppeal.find("[rel=batchAppeal]").click(function() {
                        var list = [];
                        _self.warp.find("[rel=list] [want_appeal_id]").each(function() {
                            var waid = $(this).attr("want_appeal_id");
                            if (waid && waid != 0) {
                                list.push(waid)
                            }
                        });
                        window.open("//115.com/?ct=public_share&ac=appeal&showType=uploadBatch&want_appeal_ids=" + list.join(","));
                        return false
                    });
                    _self.warp.addClass("upload-box").css({
                        height: ""
                    });
                    _content.find("[btn='clear']").unbind("click").bind("click", function() {
                        return false
                    });
                    bindEvent();
                    _loadState = true;
                    var settings_ele = _self.warp.find('[data-title="upload_type"]');
                    _setting_dom = Core.FloatMenu.Show("up_setting", null, {
                        isFrame: 1
                    });
                    if (_setting_dom) {
                        if (!window.IS_HIDDEN_MODE) {
                            Util.DropDown.Bind({
                                Title: settings_ele,
                                Content: _setting_dom,
                                IsOverShow: true,
                                ShowHandler: function() {
                                    var ele = settings_ele;
                                    var t = ele.offset().top + ele.height();
                                    var l = ele.offset().left - 10;
                                    Core.FloatMenu.SetRightBtnPos(_setting_dom, "up_setting", l, t, ele.width(), ele.height());
                                    if (Core.Update115) {
                                        _setting_dom.find('[val="flash"]').hide()
                                    } else {
                                        _setting_dom.find('[val="flash"]').show()
                                    }
                                }
                            })
                        } else {
                            settings_ele.find("i").hide()
                        }
                        var menuList = _setting_dom.find("[val]");
                        menuList.each(function(i) {
                            var item = $(this);
                            item.click(function(e) {
                                var os_file_upload_type = 0;
                                switch ($(this).attr("val")) {
                                case "ocx1":
                                    os_file_upload_type = 1;
                                    break;
                                case "ocx2":
                                    os_file_upload_type = 2;
                                    break;
                                case "ocx3":
                                    os_file_upload_type = 3;
                                    break;
                                case "ocx4":
                                    os_file_upload_type = 4;
                                    break
                                }
                                Core.NewSetting.Change({
                                    isp_upload: os_file_upload_type
                                }, function(r) {
                                    if (r.state) {
                                        if (Core.CONFIG.Webkit42) {
                                            Core.Message.Confirm({
                                                text: "请下载115电脑版高速稳定上传",
                                                content: "<span style='color: #F60;'>安装完成后，请使用115电脑版高速稳定上传。</span>",
                                                type: "war",
                                                confirm_link: "http://pc.115.com",
                                                confirm_text: "立即下载"
                                            });
                                            return false
                                        }
                                        ctl.ChangeEngine(os_file_upload_type ? 1 : 0, os_file_upload_type)
                                    }
                                });
                                return false
                            })
                        });
                        ctl.AddSetEngineClient(checkUpEngine);
                        if (window.IS_HIDDEN_MODE) {
                            _self.warp.find('[data-title="upload_type"] span').text("普通上传")
                        }
                        Util.log("初始化UI")
                    }
                    actions.init && actions.init(_self.warp)
                },
                Message: function(str, minstr, iscomplete) {
                    msgBox.html(str);
                    var totalobj = null;
                    if (!iscomplete) {
                        totalobj = {
                            text: minstr
                        }
                    }
                    _MinForm.Progress(totalobj)
                },
                Open: function(callback) {
                    _top.CreateDom();
                    if (_loadState) {
                        _self.warp.show()
                    } else {
                        _loadState = true
                    }
                    var l = _self.warp.offset().left;
                    if (l < 0) {
                        Util.Layer.Center(_self.warp, {
                            Main: false,
                            NoAddScrollTop: true
                        })
                    }
                    if (_isClose) {
                        _isClose = false;
                        Core.WinHistory.Add(_self)
                    }
                    if (!_initState) {
                        _initState = true;
                        $(document).on("keyup", function(e) {
                            if (e.keyCode == 27 && !_isClose) {
                                ui.Close()
                            }
                        })
                    }
                    Core.WinHistory.Active(_self);
                    _self.IsOpen = true;
                    callback && callback()
                },
                Close: function() {
                    _self.Hide();
                    Core.WinHistory.Del(_self.Key);
                    _self.IsOpen = false;
                    _isClose = true
                },
                Hide: function() {
                    var l = _self.warp.offset().left;
                    _self.warp.css({
                        left: l - 9999
                    });
                    _self.DeActive();
                    Core.WinHistory.DeActiveStatus(_self);
                    _self.IsActive = false;
                    _loadState = false;
                    _self.IsOpen = false
                },
                IsClose: function() {
                    return _isClose
                },
                Add: function(file) {
                    var dom = domlist.find("[file_id='" + file.id + "']");
                    if (!dom.length) {
                        if (!file.size_str) {
                            file.size_str = Util.File.ShowSize(file.size, 1)
                        }
                        file.name_cut = Util.Text.Cut(file.name, 15);
                        dom = $(String.formatmodel(_fileTemp, file));
                        if (file.is_dir) {
                            dom.find(".file-small").removeClass("file-small").addClass("folder-small")
                        }
                        domlist.append(dom);
                        if (file.status == 4) {
                            _self.Update(file)
                        }
                        getBtn({
                            dom: dom,
                            text: "删除",
                            className: "ico-remove",
                            callback: function() {
                                if (_datalist[file.id]) {
                                    delete _datalist[file.id]
                                }
                                actions["delete"] && actions["delete"](file);
                                var ele = $(this);
                                window.setTimeout(function() {
                                    ele.parents("[file_id]").empty().remove();
                                    checkList()
                                }, 1);
                                UpdatePopup(file, null, "delete");
                                return false
                            }
                        });
                        if (file.up_type == 2 || file.up_type == 3) {
                            var pauseBtn = getBtn({
                                dom: dom,
                                text: "暂停",
                                className: "ico-pause",
                                callback: function() {
                                    actions.pause && actions.pause(file);
                                    return false
                                }
                            });
                            var startBtn = getBtn({
                                dom: dom,
                                text: "继续",
                                className: "ico-start",
                                callback: function() {
                                    actions.reupload && actions.reupload(file);
                                    return false
                                }
                            });
                            pauseBtn.hide();
                            startBtn.hide()
                        }
                        if (file.up_type == 3) {
                            var infoBtn = getBtn({
                                dom: dom,
                                text: "详情",
                                className: "ico-err-info",
                                callback: function() {
                                    var item = $(this).parents("[file_id]");
                                    var cid = item.attr("cid");
                                    try {
                                        actions.getinfo && actions.getinfo(item.attr("file_id"))
                                    } catch (e) {}
                                }
                            });
                            infoBtn.hide()
                        }
                    }
                    checkList();
                    if (!_datalist[file.id]) {
                        _datalist[file.id] = {
                            dom: domlist.find("[file_id='" + file.id + "']"),
                            file: file
                        }
                    }
                    switch (file.status) {
                    case 4:
                        dom.find('[rel="size_str"]').html("- " + file.size_str);
                        break;
                    case 5:
                        if (file.size * 1 < 1) {
                            dom.find('[rel="size_str"]').html("")
                        } else {
                            dom.find('[rel="size_str"]').html("- " + file.size_str)
                        }
                        break
                    }
                    UpdatePopup(file, null, "add");
                    return dom
                },
                CTLButton: function(file, pause, conti) {
                    if (!_datalist[file.id]) {
                        return
                    }
                    if (file.up_type == 2 || file.up_type == 3) {
                        var dom = _datalist[file.id].dom;
                        if (dom.length) {
                            var pauseBtn = getBtn({
                                dom: dom,
                                className: "ico-pause"
                            });
                            var contiBtn = getBtn({
                                dom: dom,
                                className: "ico-start"
                            });
                            if (pause) {
                                if (!pauseBtn.is(":hidden")) {
                                    pauseBtn.hide()
                                }
                            } else {
                                if (pauseBtn.is(":hidden")) {
                                    pauseBtn.css({
                                        display: ""
                                    })
                                }
                            }
                            if (conti) {
                                if (!contiBtn.is(":hidden")) {
                                    contiBtn.hide()
                                }
                            } else {
                                if (contiBtn.is(":hidden")) {
                                    contiBtn.css({
                                        display: ""
                                    })
                                }
                            }
                        }
                    }
                },
                GetAllFiles: function(e) {
                    uploadSourceConfig = e;
                    var res = [];
                    if (_datalist) {
                        for (var k in _datalist) {
                            var item = _datalist[k].file;
                            res.push(item)
                        }
                    }
                    return res
                },
                IsExist: function(file) {
                    var result = false;
                    if (_datalist) {
                        for (var k in _datalist) {
                            var item = _datalist[k].file;
                            if (item.name == file.name && item.aid == file.aid) {
                                if (item.cid != undefined || file.cid != undefined) {
                                    if (item.cid == file.cid) {
                                        return true
                                    }
                                } else {
                                    return true
                                }
                            }
                        }
                    }
                    return result
                },
                Delete: function(file) {
                    if (!_datalist[file.id]) {
                        return
                    }
                    var dom = _datalist[file.id].dom;
                    if (_datalist[file.id]) {
                        delete _datalist[file.id]
                    }
                    window.setTimeout(function() {
                        dom.empty().remove();
                        checkList()
                    }, 1);
                    UpdatePopup(file, null, "delete")
                },
                Msage: function(file, text) {
                    if (!_datalist[file.id]) {
                        return
                    }
                    var dom = _datalist[file.id].dom;
                    if (!dom.length) {
                        dom = _self.Add(file)
                    }
                    var status = dom.find('[rel="status"]');
                    status.html(text)
                },
                Update: function(file, data) {
                    if (!_datalist[file.id]) {
                        return
                    }
                    var dom = _datalist[file.id].dom;
                    if (!dom.length) {
                        dom = _self.Add(file)
                    }
                    var status = dom.find('[rel="status"]');
                    var statusStr = "等待上传";
                    var iserr = false;
                    var ico = dom.find('[rel="ico"]');
                    var progress = dom.find('[rel="progress"]');
                    if (file.up_type == 1) {
                        progress.css({
                            width: file.percent + "%"
                        });
                        if (file.error) {
                            statusStr = file.error ? file.error : "上传失败";
                            iserr = true;
                            ico[0].className = "hint-icon hint-err-s";
                            dom.attr("complete", 1)
                        } else {
                            switch (file.status) {
                            case 2:
                                if (file.percent == 100) {
                                    statusStr = "正在校验文件"
                                } else {
                                    statusStr = "正在上传 (" + file.percent + "%)"
                                }
                                if (!ico.hasClass("file-small")) {
                                    ico[0].className = "file-small"
                                }
                                break;
                            case 4:
                                dom.attr("complete", 1);
                                statusStr = file.error ? file.error : "上传失败";
                                iserr = true;
                                ico[0].className = "hint-icon hint-err-s";
                                break;
                            case 5:
                                statusStr = file.checking ? "正在加密存储中..." : "上传成功";
                                ico[0].className = "hint-icon hint-suc-s";
                                progress.hide();
                                dom.attr("complete", 1);
                                dom.attr("success", 1);
                                if (file.aid != 999) {
                                    getBtn({
                                        dom: dom,
                                        text: "查看",
                                        className: "ico-folder",
                                        hide: uploadSourceConfig && uploadSourceConfig.config.hideToViewBtn || false,
                                        callback: function() {
                                            var item = $(this).parents("[file_id]");
                                            var aid = item.attr("aid")
                                              , cid = item.attr("cid");
                                            if (Ext.CACHE && Ext.CACHE.FileMain) {
                                                Ext.CACHE.FileMain.GotoDir(aid, cid)
                                            }
                                            _self.Close()
                                        }
                                    })
                                }
                                break
                            }
                        }
                        if (file.status == 4) {
                            status.attr("title") != statusStr && status.attr("title", statusStr)
                        }
                    } else {
                        if (file.up_type == 2) {
                            var status = dom.find('[rel="status"]');
                            var statusStr = "等待上传";
                            if (data && data.text) {
                                statusStr = data.text
                            } else {
                                if (file.is_uploading == 1) {
                                    if (file.is_dir && file.deal_count) {
                                        statusStr = "正在上传";
                                        statusStr += ("第" + file.deal_count + "个文件");
                                        if (file.hash_percent) {
                                            statusStr += "(校验" + file.hash_percent + ")"
                                        } else {
                                            statusStr += " " + file.progress + " " + file.speed_str
                                        }
                                    } else {
                                        statusStr = "正在上传";
                                        statusStr += " " + file.progress + " " + file.speed_str
                                    }
                                    dom.find('[rel="size_str"]').html("- " + file.size_str);
                                    progress.css({
                                        width: file.progress.replace("%", "") + "%"
                                    })
                                }
                            }
                            var startBtn = getBtn({
                                dom: dom,
                                className: "ico-start"
                            });
                            if (startBtn.html() != "继续") {
                                startBtn.html("继续")
                            }
                            if (data && data.err) {
                                iserr = true;
                                ico[0].className = "hint-icon hint-err-s";
                                startBtn.html("重试")
                            } else {
                                if (file.is_dir) {
                                    if (ico[0].className != "folder-small") {
                                        ico[0].className = "folder-small"
                                    }
                                } else {
                                    if (ico[0].className != "file-small") {
                                        ico[0].className = "file-small"
                                    }
                                }
                            }
                            switch (Number(file.status)) {
                            case 9:
                                statusStr = file.checking ? "正在加密存储中..." : "上传成功";
                                if (!file.checking) {
                                    if (file.load_str && file.load_str.indexOf("6|") == -1) {
                                        statusStr += ' <span style="color:rgb(0, 199, 96);">云秒传</span>'
                                    }
                                }
                                ico[0].className = "hint-icon hint-suc-s";
                                progress.hide();
                                dom.attr("complete", 1);
                                dom.attr("success", 1);
                                getBtn({
                                    dom: dom,
                                    text: "查看",
                                    className: "ico-folder",
                                    callback: function() {
                                        var item = $(this).parents("[file_id]");
                                        var aid = item.attr("aid")
                                          , cid = item.attr("cid");
                                        if (Ext.CACHE && Ext.CACHE.FileMain) {
                                            Ext.CACHE.FileMain.GotoDir(aid, cid)
                                        }
                                        _self.Close()
                                    }
                                });
                                getBtn({
                                    dom: dom,
                                    className: "ico-pause"
                                }).hide();
                                getBtn({
                                    dom: dom,
                                    className: "ico-start"
                                }).hide();
                                break
                            }
                        } else {
                            if (file.up_type == 3) {
                                var status = dom.find('[rel="status"]');
                                var statusStr = "等待上传";
                                if (data && data.text) {
                                    statusStr = data.text
                                } else {
                                    if (file.is_uploading == 1) {
                                        if (file.is_dir && file.deal_count) {
                                            statusStr = "正在上传";
                                            statusStr += ("第" + file.deal_count + "个文件");
                                            if (file.hash_percent) {
                                                statusStr += "(校验" + file.hash_percent + ")"
                                            } else {
                                                statusStr += " " + file.progress + "% " + file.speed_str
                                            }
                                        } else {
                                            statusStr = "正在上传";
                                            statusStr += " " + file.progress + "% " + file.speed_str
                                        }
                                        dom.find('[rel="size_str"]').html("- " + file.size_str);
                                        progress.css({
                                            width: file.progress + "%"
                                        })
                                    }
                                }
                                var startBtn = getBtn({
                                    dom: dom,
                                    className: "ico-start"
                                });
                                if (startBtn.html() != "继续") {
                                    startBtn.html("继续")
                                }
                                if (file.is_dir) {
                                    if (ico[0].className != "folder-small") {
                                        ico[0].className = "folder-small"
                                    }
                                } else {
                                    if (ico[0].className != "file-small") {
                                        ico[0].className = "file-small"
                                    }
                                }
                                dom.removeClass("err");
                                ico.removeClass("hint-err-s");
                                var infoBtn = getBtn({
                                    dom: dom,
                                    className: "ico-err-info"
                                });
                                if (infoBtn.length) {
                                    infoBtn.hide()
                                }
                                switch (file.status) {
                                case 1:
                                    dom.find('[rel="size_str"]').html("");
                                    break;
                                case 2:
                                    dom.find('[rel="size_str"]').html("- " + file.size_str);
                                    if (file.percent == 100) {
                                        statusStr = "正在校验文件"
                                    } else {
                                        statusStr = "正在上传 (" + file.percent + "%)"
                                    }
                                    if (file.is_dir) {
                                        if (ico[0].className != "folder-small") {
                                            ico[0].className = "folder-small"
                                        }
                                    } else {
                                        if (ico[0].className != "file-small") {
                                            ico[0].className = "file-small"
                                        }
                                    }
                                    break;
                                case 4:
                                    dom.find('[rel="size_str"]').html("- " + file.size_str);
                                    break;
                                case 5:
                                    if (file.size * 1 < 1) {
                                        dom.find('[rel="size_str"]').html("")
                                    } else {
                                        dom.find('[rel="size_str"]').html("- " + file.size_str)
                                    }
                                    break;
                                case 7:
                                    statusStr = file.error ? file.error : "上传失败";
                                    iserr = true;
                                    ico[0].className = "hint-icon hint-err-s";
                                    if (file.is_dir && infoBtn.length && file.error.indexOf("部分文件上传失败") != -1) {
                                        infoBtn.show()
                                    }
                                    startBtn.html("重试");
                                    break;
                                case 8:
                                    statusStr = file.checking ? "正在加密存储中..." : "上传成功";
                                    ico[0].className = "hint-icon hint-suc-s";
                                    progress.hide();
                                    dom.attr("complete", 1);
                                    dom.attr("success", 1);
                                    if (file.aid != 999) {
                                        getBtn({
                                            dom: dom,
                                            text: "查看",
                                            className: "ico-folder",
                                            callback: function() {
                                                var item = $(this).parents("[file_id]");
                                                var aid = item.attr("aid")
                                                  , cid = item.attr("cid");
                                                if (Ext.CACHE && Ext.CACHE.FileMain) {
                                                    Ext.CACHE.FileMain.GotoDir(aid, cid)
                                                }
                                                _self.Close()
                                            }
                                        })
                                    }
                                    break;
                                case 9:
                                    statusStr = file.checking ? "正在加密存储中..." : "上传成功";
                                    if (!file.checking) {
                                        if (file.is_second) {
                                            statusStr += ' <span style="color:rgb(0, 199, 96);">云秒传</span>'
                                        }
                                    }
                                    ico[0].className = "hint-icon hint-suc-s";
                                    progress.hide();
                                    dom.attr("complete", 1);
                                    dom.attr("success", 1);
                                    getBtn({
                                        dom: dom,
                                        text: "查看",
                                        className: "ico-folder",
                                        callback: function() {
                                            var item = $(this).parents("[file_id]");
                                            var aid = item.attr("aid")
                                              , cid = item.attr("cid");
                                            if (Ext.CACHE && Ext.CACHE.FileMain) {
                                                Ext.CACHE.FileMain.GotoDir(aid, cid)
                                            }
                                            _self.Close()
                                        }
                                    });
                                    getBtn({
                                        dom: dom,
                                        className: "ico-pause"
                                    }).hide();
                                    getBtn({
                                        dom: dom,
                                        className: "ico-start"
                                    }).hide();
                                    break
                                }
                            }
                        }
                    }
                    if (iserr) {
                        if (!dom.hasClass("err")) {
                            dom.addClass("err");
                            progress.hide()
                        }
                    } else {
                        if (dom.hasClass("err")) {
                            dom.removeClass("err");
                            if (progress.is(":hidden")) {
                                progress.show()
                            }
                        }
                    }
                    if (+file.status === 5 && file.failData && file.failData.is_appeal) {
                        statusStr += '<span style="color:#2777F8;cursor: pointer;margin-left:10px;" rel="to_complaint">去申诉 >></span>'
                    }
                    status.html() != statusStr && status.html(statusStr);
                    status.attr("want_appeal_id", (file && file.failData && file.failData.want_appeal_id) || "");
                    status.find('[rel="to_complaint"]').on("click", function() {
                        $.ajax({
                            url: "//webapi.115.com/files/upload_appeal_push",
                            type: "GET",
                            data: {
                                doubt_file_name: file.failData.doubt_file_name,
                                file_name: file.failData.file_name,
                                file_type: file.failData.file_type,
                                sha1: file.failData.sha1
                            },
                            xhrFields: {
                                withCredentials: true
                            },
                            dataType: "json",
                            success: function(r) {
                                if (r.state) {
                                    _self.ComplainModal(r.data, file.failData)
                                }
                            }
                        })
                    });
                    checkList();
                    UpdatePopup(file, data, "update")
                },
                ComplainModal: function(e, failData) {
                    var resultTip = "";
                    if (e.appeal_state === 2) {
                        resultTip = "恭喜！你申诉的内容经过审核已解封!<br>(重新上传文件即可成功）"
                    } else {
                        if (e.appeal_state === 3) {
                            resultTip = "经审核，你申诉的内容未通过，请共同维护清朗的网络环境。"
                        }
                    }
                    var setting = {
                        data: {
                            sourceData: {
                                ico: e.file_name.substr(e.file_name.lastIndexOf(".") + 1),
                                img_url: e.img_url || "",
                                file_name: e.file_name,
                                complaintStatus: e.appeal_state === 1 || e.appeal_state === 2 || e.appeal_state === 3 ? true : false,
                                resultTip: resultTip,
                                postUrl: "/files/common_appeal_push",
                                postParams: {
                                    reason: "",
                                    image_hash: "",
                                    want_appeal_id: failData.want_appeal_id || ""
                                }
                            }
                        },
                        dialogClose: function() {
                            dg && dg.Close()
                        },
                        closeBtnClick: function(e) {}
                    };
                    var isRC = top.location.host.indexOf("rc") !== -1;
                    var baseUrlGetComplant = isRC ? "//115.com" : "//115.com";
                    var html_url = __uri(baseUrlGetComplant + "/static/components_vue/common/AddFileComplant.html");
                    var dg = top.Core.FrameDG.Open(html_url, {
                        title: "申诉",
                        width: 500,
                        height: 454,
                        ready: function(win) {
                            win.addFileComplainInit(setting)
                        },
                        callback: function() {},
                        is_hide_back: true
                    })
                },
                UpdatePopup: UpdatePopup
            }, {
                title: '<strong data-title="upload_type"><span>普通上传</span><i></i></strong>',
                content: _content,
                width: 840,
                height: 500,
                is_not_resize: true,
                min_title: "<span>文件上传</span>"
            })
        }
        )();
        ctl.ui = ui
    }
}
)(Core.Upload);
