/* Javascript for the Immocalc appplication */
/* Pierre Haessig - November 2014 */


/* Basic formulas for load amortization */

function calcAmort(K, T, Ti, y) {
    r = T/12
    n = y*12
    M = K*r/(1-1/Math.pow(1+r,n))
    // Insurance:
    M = M + K*Ti/12
    return M
}

function calcCapital(M, T, Ti, y) {
    r = T/12
    n = y*12
    K = M/(r/(1-1/Math.pow(1+r,n)) + Ti/12 )
    return K
}

function calcDuration(K, T, Ti, M) {
    // Insurance:
    M = M - K*Ti/12
    r = T/12
    n = Math.log(M/(M-K*r))/Math.log(1+r)
    y = n/12
    return y
}

function calcInsur(K, Ti) {
    // How much insurance per month
    return K * Ti/12
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
    
    // Grab all variables, with unit conversion
    var rate = $('#slider-rate').val()/100
    var insur = $('#slider-insur').val()/100
    var amort = $('#slider-amort').val()
    var duration = $('#slider-duration').val()
    var capital = $('#slider-capital').val()*1000
    //console.log('rate ' + rate + ' insur ' + insur)
    
    
    // Compute the appropriate output
    mode = getCalcMode()
    
    switch (mode) {
      case 'amort':
        amort = calcAmort(capital, rate, insur, duration)
        output = 'Mensualité : <strong>' + amort.toFixed(0) +'</strong> €/mois'
        output += ', dont ' + calcInsur(capital, insur).toFixed(0) + ' € d\'assurance'
        $('#slider-amort').val(amort).slider('refresh')
        break;
      case 'duration':
        duration = calcDuration(capital, rate, insur, amort)
        output = 'Durée du prêt : <strong>'+ duration.toFixed(1)+'</strong> années'
        output += ' (' + (duration*12).toFixed(0) + ' mois)'
        $('#slider-duration').val(duration).slider('refresh')
        break;
      case 'capital':
        capital = calcCapital(amort, rate, insur, duration)
        output = 'Capital empruntable : <strong>' + (capital/1000).toFixed(1) + '<strong> k€'
        $('#slider-capital').val(capital/1000).slider('refresh')
        break;
      default:
        console.log('bad mode: '+mode )
    }
    
    // Update the detailed cost output
    // TODO: do only if visible
    costTotal = amort*duration*12 - capital
    costInsur = calcInsur(capital, insur)*duration*12
    costInter = costTotal - costInsur
    
    function costFmt(cost) {
      return Math.round(cost).toLocaleString('fr-FR') + ' €'
    }
    
    $('#cost-inter').text(costFmt(costInter))
    $('#cost-insur').text(costFmt(costInsur))
    $('#cost-total').text(costFmt(costTotal))
    
    // display
    $('#output').html(output);
    
    // save
    loan = {
        'rate':rate,
        'insur':insur,
        'amort':amort,
        'duration':duration,
        'capital':capital
        }
    saveState(loan)
}


/*Save and restore state*/
function saveState(loan) {
    localStorage['loan'] = JSON.stringify(loan)
    localStorage['mode'] = getCalcMode()
}

function restoreState() {
    loan = localStorage['loan']
    mode = localStorage['mode']
    if (!loan || !mode) {
        console.log('no state to restore')
        return
    }
    
    loan = JSON.parse(loan)
    console.log(loan)
    
    // set all sliders:
    $('#slider-rate').val(loan.rate*100).slider('refresh')
    $('#slider-insur').val(loan.insur*100).slider('refresh')
    $('#slider-amort').val(loan.amort).slider('refresh')
    $('#slider-duration').val(loan.duration).slider('refresh')
    $('#slider-capital').val(loan.capital/1000).slider('refresh')
    console.log('Previous state restored')
}


/* Initialization after page load*/
function initApp() {
    // take the sliders out of the tab navigation
    $('.ui-slider-handle').attr('tabindex', '-1');
    
    // Restore state, before connecting event handlers
    restoreState()
    
    // Connect event handlers:
    $("#modeForm input[type=radio]").change(initCalcMode);
    $('#paramForm input').change(computeOutput);
    
    initCalcMode();
}

$(document).on("pagecreate", "#main-page", initApp)
