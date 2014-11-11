/* Javascript for the Immocalc appplication */
/* Pierre Haessig - November 2014 */


/* Basic formulas for load amortization */

function calcAmort(K,T,Ti,y) {
    r = T/12
    n = y*12
    M = K*r/(1-1/Math.pow(1+r,n))
    // Insurance:
    M = M + K*Ti/12
    return M
}

function calcCapital(M,T,Ti,y) {
    r = T/12
    n = y*12
    K = M/(r/(1-1/Math.pow(1+r,n)) + Ti/12 )
    return K
}

function calcDuration(K,T,Ti, M) {
    // Insurance:
    M = M - K*Ti/12
    r = T/12
    n = Math.log(M/(M-K*r))/Math.log(1+r)
    y = n/12
    return y
}


/* Mode switching logic */
/* 3 computation modes: amortization, duration or capital*/

function getCalcMode() {
    // current calculaltion mode : amort, duration or capital
    return $('#modeForm input[type=radio]:checked').val()
}

function initCalcMode() {
    mode = getCalcMode()
    console.log('New computation mode: ' + mode)
    
    /* Update the UI */
    switch (mode) {
      case 'amort':
        $('.slider-amort').hide("drop")
        $('.slider-duration').show("drop")
        $('.slider-capital').show("drop")
        break;
      case 'duration':
        $('.slider-amort').show("drop")
        $('.slider-duration').hide("drop")
        $('.slider-capital').show("drop")
        break;
      case 'capital':
        $('.slider-amort').show("drop")
        $('.slider-duration').show("drop")
        $('.slider-capital').hide("drop")
        break;
      default:
        console.log('bad mode: '+mode )
    }
    
    // Force computing the ouput
    computeOutput()
  }
  


/* React to input value changes: recompute the output */

function computeOutput(event) {
    // stop the recursive change events:
    if (event) {
        switch (mode) {
          case 'amort':
            if (event.target.id == 'slider-amort') {return;}
            break;
          case 'duration':
            if (event.target.id == 'slider-duration') {return;}
            break;
          case 'capital':
            if (event.target.id == 'slider-capital') {return;}
            break;
          default:
            console.log('bad mode: '+mode )
        }
    }
    
    console.log('Compute ouput');
    
    // Grab all variables:
    var rate = $('#slider-rate').val()
    var insur = $('#slider-insur').val()
    var amort = $('#slider-amort').val()
    var duration = $('#slider-duration').val()
    var capital = $('#slider-capital').val()
    //console.log('rate ' + rate + ' insur ' + insur)
    
    
    // Compute the appropriate output
    mode = getCalcMode()
    
    switch (mode) {
      case 'amort':
        M = calcAmort(capital*1000, rate/100, insur/100, duration)
        output = 'Mensualité : <strong>' + M.toFixed(2) +'</strong> €/mois'
        $('#slider-amort').val(M).slider('refresh')
        break;
      case 'duration':
        y = calcDuration(capital*1000, rate/100, insur/100, amort)
        output = 'Durée du prêt : <strong>'+ y.toFixed(1)+'</strong> années'
        $('#slider-duration').val(y).slider('refresh')
        break;
      case 'capital':
        K = calcCapital(amort, rate/100, insur/100, duration)
        output = 'Capital empruntable : <strong>' + (K/1000).toFixed(1) + '<strong> k€'
        $('#slider-capital').val(K/1000).slider('refresh')
        break;
      default:
        console.log('bad mode: '+mode )
    }
    
    // display
    $('#output').html(output);
}


function initApp() {
    // take the sliders out of the tab navigation
    $('.ui-slider-handle').attr('tabindex', '-1');
    
    $("#modeForm input[type=radio]").change(initCalcMode);
    
    $('#paramForm input').change(computeOutput);
    
    initCalcMode();

}

$(document).on("pagecreate", "#main-page", initApp)
