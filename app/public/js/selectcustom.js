document.addEventListener('DOMContentLoaded', function() {
    var customSelects = document.getElementsByClassName("custom-select");
    
    for (var i = 0; i < customSelects.length; i++) {
        var selElmnt = customSelects[i].getElementsByTagName("select")[0];
        var selectedDiv = document.createElement("DIV");
        
        selectedDiv.setAttribute("class", "select-selected");
        selectedDiv.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        customSelects[i].appendChild(selectedDiv);
        
        var itemsDiv = document.createElement("DIV");
        itemsDiv.setAttribute("class", "select-items select-hide");
        
        for (var j = 0; j < selElmnt.length; j++) {
            var optionDiv = document.createElement("DIV");
            optionDiv.innerHTML = selElmnt.options[j].innerHTML;
            optionDiv.setAttribute("data-value", selElmnt.options[j].value);
            
            if (j === selElmnt.selectedIndex) {
                optionDiv.setAttribute("class", "same-as-selected");
            }
            
            optionDiv.addEventListener("click", function(e) {
                var select = this.parentNode.parentNode.getElementsByTagName("select")[0];
                var selectedDiv = this.parentNode.previousSibling;
                
                for (var k = 0; k < select.length; k++) {
                    if (select.options[k].value === this.getAttribute("data-value")) {
                        select.selectedIndex = k;
                        selectedDiv.innerHTML = this.innerHTML;
                        
                        var sameAsSelected = this.parentNode.getElementsByClassName("same-as-selected");
                        for (var l = 0; l < sameAsSelected.length; l++) {
                            sameAsSelected[l].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                selectedDiv.click();
                
                // Disparar evento change
                var event = new Event('change', { bubbles: true });
                select.dispatchEvent(event);
            });
            
            itemsDiv.appendChild(optionDiv);
        }
        
        customSelects[i].appendChild(itemsDiv);
        
        selectedDiv.addEventListener("click", function(e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }
    
    function closeAllSelect(elmnt) {
        var arrNo = [];
        var items = document.getElementsByClassName("select-items");
        var selected = document.getElementsByClassName("select-selected");
        
        for (var i = 0; i < selected.length; i++) {
            if (elmnt == selected[i]) {
                arrNo.push(i);
            } else {
                selected[i].classList.remove("select-arrow-active");
            }
        }
        
        for (var i = 0; i < items.length; i++) {
            if (arrNo.indexOf(i)) {
                items[i].classList.add("select-hide");
            }
        }
    }
    
    document.addEventListener("click", closeAllSelect);
});