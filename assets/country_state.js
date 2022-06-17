function ajaxCall() {
    this.send = function(data, url, method, success, type) {
        type = type || 'json';
        var successRes = function(data) {
            success(data);
        }
        var errorRes = function(e) {
            console.log(e);
        }
        jQuery.ajax({
            url: url,
            type: method,
            data: data,
            success: successRes,
            error: errorRes,
            dataType: type,
            timeout: 60000
        });
    }
}

function locationInfo() {
    var rootUrl = "//geodata.solutions/api/api.php";
    var username = 'demo';
    var ordering = 'name';
    var addParams = '';
    if (jQuery("#gds_appid").length > 0) {
        addParams += '&appid=' + jQuery("#gds_appid").val();
    }
    if (jQuery("#gds_hash").length > 0) {
        addParams += '&hash=' + jQuery("#gds_hash").val();
    }
    var call = new ajaxCall();
    this.confCity = function(id) {
        var url = rootUrl + '?type=confCity&countryId=' + jQuery('#countryId option:selected').attr('countryid') + '&stateId=' + jQuery('#stateId option:selected').attr('stateid') + '&cityId=' + id;
        var method = "post";
        var data = {};
        call.send(data, url, method, function(data) {
            if (data) {} else {}
        });
    };
    this.getCities = function(id) {
        jQuery(".cities option:gt(0)").remove();
        var stateClasses = jQuery('#cityId').attr('class');
        var cC = stateClasses.split(" ");
        cC.shift();
        var addClasses = '';
        if (cC.length > 0) {
            acC = cC.join();
            addClasses = '&addClasses=' + encodeURIComponent(acC);
        }
        var url = rootUrl + '?type=getCities&countryId=' + jQuery('#countryId option:selected').attr('countryid') + '&stateId=' + id + addParams + addClasses;
        var method = "post";
        var data = {};
        jQuery('.cities').find("option:eq(0)").html("Please wait..");
        call.send(data, url, method, function(data) {
            jQuery('.cities').find("option:eq(0)").html("Select City");
            if (data.tp == 1) {
                if (data.hits > 1000) {
                    console.log('Daily geodata.solutions request limit exceeded count:' + data.hits + ' of 1000');
                } else {
                    console.log('Daily geodata.solutions request count:' + data.hits + ' of 1000')
                }
                var listlen = Object.keys(data['result']).length;
                if (listlen > 0) {
                    jQuery.each(data['result'], function(key, val) {
                        var option = jQuery('<option />');
                        option.attr('value', val).text(val);
                        jQuery('.cities').append(option);
                    });
                } else {
                    var usestate = jQuery('#stateId option:selected').val();
                    var option = jQuery('<option />');
                    option.attr('value', usestate).text(usestate);
                    option.attr('selected', 'selected');
                    jQuery('.cities').append(option);
                }
                jQuery(".cities").prop("disabled", false);
            } else {
                alert(data.msg);
            }
        });
    };
    this.getStates = function(id, state_cls) {
        jQuery(state_cls).find("option:gt(0)").remove();
        jQuery(".cities option:gt(0)").remove();
        var stateClasses = jQuery(state_cls).attr('class');
        var cC = stateClasses.split(" ");
        cC.shift();
        var addClasses = '';
        if (cC.length > 0) {
            acC = cC.join();
            addClasses = '&addClasses=' + encodeURIComponent(acC);
        }
        var url = rootUrl + '?type=getStates&countryId=' + id + addParams + addClasses;
        var method = "post";
        var data = {};
        jQuery(state_cls).find("option:eq(0)").html("Please wait..");
        call.send(data, url, method, function(data) {
            jQuery(state_cls).find("option:eq(0)").html("State Province");
            if (data.tp == 1) {
                if (data.hits > 1000) {
                    console.log('Daily geodata.solutions request limit exceeded:' + data.hits + ' of 1000');
                } else {
                    console.log('Daily geodata.solutions request count:' + data.hits + ' of 1000')
                }
                jQuery.each(data['result'], function(key, val) {
                    var option = jQuery('<option />');
                    option.attr('value', val).text(val);
                    option.attr('stateid', key);
                    jQuery(state_cls).append(option);
                });
                jQuery(state_cls).prop("disabled", false);
            } else {
                alert(data.msg);
            }
        });
    };
    this.getCountries = function(country_cls) {
        var countryClasses = jQuery(country_cls).attr('class');
        console.log(countryClasses)
        var cC = countryClasses.split(" ");
        cC.shift();
        var addClasses = '';
        if (cC.length > 0) {
            acC = cC.join();
            addClasses = '&addClasses=' + encodeURIComponent(acC);
        }
        var presel = false;
        var iip = 'N';
        jQuery.each(cC, function(index, value) {
            if (value.match("^presel-")) {
                presel = value.substring(7);
            }
            if (value.match("^presel-byi")) {
                var iip = 'Y';
            }
        });
        var url = rootUrl + '?type=getCountries' + addParams + addClasses;
        var method = "post";
        var data = {};
        
        call.send(data, url, method, function(data) {
            jQuery(country_cls).find("option:eq(0)").html("Country");
            jQuery(country_cls).find("option:eq(1)").remove();
            if (data.tp == 1) {
                if (data.hits > 1000) {
                    console.log('Daily geodata.solutions request limit exceeded:' + data.hits + ' of 1000');
                } else {
                    console.log('Daily geodata.solutions request count:' + data.hits + ' of 1000')
                }
                if (presel == 'byip') {
                    presel = data['presel'];
                    console.log('2 presel is set as ' + presel);
                }
                if (jQuery.inArray("group-continents", cC) > -1) {
                    
                    var $select = jQuery(country_cls);
                    console.log(data['result']);
                    jQuery.each(data['result'], function(i, optgroups) {
                        var $optgroup = jQuery("<optgroup>", {
                            label: i
                        });
                        if (optgroups.length > 0) {
                            $optgroup.appendTo($select);
                        }
                        jQuery.each(optgroups, function(groupName, options) {
                            var coption = jQuery('<option />');
                            coption.attr('value', options.name).text(options.name);
                            coption.attr('countryid', options.id);
                            if (presel) {
                                if (presel.toUpperCase() == options.id) {
                                    coption.attr('selected', 'selected');
                                }
                            }
                            coption.appendTo($optgroup);
                        });
                    });
                } else {
                    jQuery.each(data['result'], function(key, val) {
                       
                        var except_country = ['Austria','Germany', 'Belgium', 'Austria', 'Bulgaria', 'Belgium', 'Croatia (Hrvatska)', 'Czech Republic', 'Cyprus', 'Denmark', 'Czechia', 'Estonia',
                            'Denmark', 'Finland', 'Estonia', 'France', 'Finland', 'Greece', 'France', 'Hunary', 'Germany', 'Iceland', 'Greece', 'Italy', 'Hungary',	'Latvia', 'Ireland',
                            'Liechtenstein', 'Italy', 'Lithuania', 'Latvia', 'Lexembourg', 'Lithuania', 'Malta', 'Luxembourg', 'Netherlands Antilles', 'Malta', 'Norway', 'Netherlands',	'Poland',
                            'Poland', 'Portugal', 'Portugal', 'Slovakia', 'Romania', 'Slovenia', 'Slovakia', 'Spain', 'Slovenia', 'Sweden', 'Spain', 'Switzerland', 'Sweden'];  

                        if ($.inArray(val, except_country) < 0) {
                            var option = jQuery('<option />');
                            option.attr('value', val).text(val);
                            option.attr('countryid', key);
                            if (presel) {
                                if (presel.toUpperCase() == key) {
                                    option.attr('selected', 'selected');
                                }
                            }
                            if (val == 'United States') {
                                jQuery(country_cls).find("option:eq(0)").after(option);
                            } else {
                                jQuery(country_cls).append(option);
                            }
                            
                        
                        }
                        
                       
                    });
                }
                jQuery(country_cls).find("option:eq(1)").attr('selected', 'selected');
                jQuery(country_cls).trigger('change');
                if (presel) {
                    jQuery(country_cls).trigger('change');
                }
                jQuery(country_cls).prop("disabled", false);
            } else {
                alert(data.msg);
            }
        });
    };
}
jQuery(function() {
    jQuery(window).on('load', function () {
        var country_class="";
        var state_class="";
        if (jQuery("#shopify-section-page-catalog-single-template").length > 0) {
            country_class = "#shopify-section-page-catalog-single-template .globo-form-control:nth-child(6) .flat-input";
            state_class = "#shopify-section-page-catalog-single-template .globo-form-control:nth-child(8) .flat-input";
        } else {
            country_class = "#shopify-section-page-catalog-multiple-template .globo-form-control:nth-child(8) .flat-input";
            state_class = "#shopify-section-page-catalog-multiple-template .globo-form-control:nth-child(10) .flat-input";
        }
        console.log(country_class);
        var loc = new locationInfo();
        loc.getCountries(country_class);
        jQuery(country_class).on("change", function(ev) {
            var countryId = jQuery("option:selected", this).attr('countryid');
            if (countryId != '') {
                loc.getStates(countryId, state_class);
                jQuery(state_class).addClass('active');
            } else {
                jQuery(state_class).find("option:gt(0)").remove();
            }
        });
    })
    
});