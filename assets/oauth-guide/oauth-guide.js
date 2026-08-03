(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.documentElement;
    var sections = Array.prototype.slice.call(
      document.querySelectorAll("[data-step-section]")
    );
    var stepButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-step-target]")
    );
    var nextButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-next]")
    );
    var previousButton = document.querySelector("[data-nav-prev]");
    var resetButton = document.getElementById("resetProgress");
    var stepSelect = document.getElementById("stepSelect");
    var progressBar = document.getElementById("progressBar");
    var progressText = document.getElementById("progressText");
    var currentStepLabel = document.getElementById("currentStepLabel");
    var storageKey = "google-oauth-forms-guide-step";
    var currentId = "step-01";
    var modal = document.getElementById("imageModal");
    var modalImage = document.getElementById("modalImage");
    var modalTitle = document.getElementById("modalTitle");
    var modalCloseTargets = Array.prototype.slice.call(
      document.querySelectorAll("[data-modal-close]")
    );
    var lastImageTrigger = null;

    root.classList.add("js-enabled");

    function isKnownStep(stepId) {
      return sections.some(function (section) {
        return section.id === stepId;
      });
    }

    function readStoredStep() {
      try {
        var storedStep = window.localStorage.getItem(storageKey);
        return isKnownStep(storedStep) ? storedStep : "step-01";
      } catch (error) {
        return "step-01";
      }
    }

    function saveStep(stepId) {
      try {
        window.localStorage.setItem(storageKey, stepId);
      } catch (error) {
        return;
      }
    }

    function stepNumber(stepId) {
      var matched = /^step-(\d+)$/.exec(stepId);
      return matched ? Number(matched[1]) : 1;
    }

    function focusMain() {
      var main = document.getElementById("guide-main");
      if (main) {
        main.focus({ preventScroll: true });
      }
    }

    function showStep(stepId, shouldFocus) {
      if (!isKnownStep(stepId)) {
        return;
      }

      currentId = stepId;
      sections.forEach(function (section) {
        var active = section.id === stepId;
        section.classList.toggle("is-active", active);
        section.setAttribute("aria-hidden", active ? "false" : "true");
      });

      stepButtons.forEach(function (button) {
        var active = button.getAttribute("data-step-target") === stepId;
        button.classList.toggle("is-active", active);
        if (active) {
          button.setAttribute("aria-current", "step");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      if (stepSelect) {
        stepSelect.value = stepId;
      }

      var number = stepNumber(stepId);
      if (progressBar) {
        progressBar.value = number;
        progressBar.setAttribute("aria-valuenow", String(number));
        progressBar.setAttribute("aria-valuetext", String(number) + " / 18");
      }
      if (progressText) {
        progressText.textContent = String(number) + " / 18";
      }
      if (currentStepLabel) {
        currentStepLabel.textContent = "目前為第 " + String(number) + " 步";
      }

      saveStep(stepId);
      if (shouldFocus) {
        focusMain();
      }
    }

    function nextStep(stepId) {
      var targetIndex = sections.findIndex(function (section) {
        return section.id === stepId;
      });
      if (targetIndex >= 0) {
        showStep(stepId, true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    stepButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        nextStep(button.getAttribute("data-step-target"));
      });
    });

    nextButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        nextStep(button.getAttribute("data-next"));
      });
    });

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        var currentIndex = sections.findIndex(function (section) {
          return section.id === currentId;
        });
        if (currentIndex > 0) {
          nextStep(sections[currentIndex - 1].id);
        }
      });
    }

    if (stepSelect) {
      stepSelect.addEventListener("change", function () {
        nextStep(stepSelect.value);
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        var shouldReset = window.confirm(
          "要清除目前進度並從第 1 步開始嗎？"
        );
        if (shouldReset) {
          nextStep("step-01");
        }
      });
    }

    function openModal(trigger) {
      if (!modal || !modalImage) {
        return;
      }
      var image = trigger.querySelector("img");
      if (!image) {
        return;
      }
      lastImageTrigger = trigger;
      modalImage.textContent = "";
      var enlargedImage = document.createElement("img");
      enlargedImage.src = image.src;
      enlargedImage.alt = image.alt;
      modalImage.appendChild(enlargedImage);
      modalImage.setAttribute("aria-label", image.alt || "截圖放大檢視");
      if (modalTitle) {
        modalTitle.textContent = image.alt || "截圖放大檢視";
      }
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      var closeButton = modal.querySelector(".modal-close");
      if (closeButton) {
        closeButton.focus({ preventScroll: true });
      }
    }

    function getModalFocusableElements() {
      if (!modal) {
        return [];
      }
      return Array.prototype.slice.call(
        modal.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
            'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
            '[contenteditable], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(function (element) {
        return element.getClientRects().length > 0 &&
          window.getComputedStyle(element).visibility !== "hidden";
      });
    }

    function closeModal() {
      if (!modal) {
        return;
      }
      var triggerToRestore = lastImageTrigger;
      lastImageTrigger = null;
      modal.setAttribute("aria-hidden", "true");
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      if (modalImage) {
        modalImage.textContent = "";
        modalImage.setAttribute("aria-label", "截圖放大檢視");
      }
      if (triggerToRestore && document.contains(triggerToRestore)) {
        triggerToRestore.focus({ preventScroll: true });
      }
    }

    Array.prototype.slice.call(
      document.querySelectorAll("[data-image-modal]")
    ).forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openModal(trigger);
      });
    });

    modalCloseTargets.forEach(function (target) {
      target.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (modal && !modal.hidden) {
        if (event.key === "Escape") {
          closeModal();
          return;
        }
        if (event.key === "Tab") {
          var focusableElements = getModalFocusableElements();
          if (!focusableElements.length) {
            event.preventDefault();
            return;
          }
          var firstFocusable = focusableElements[0];
          var lastFocusable = focusableElements[focusableElements.length - 1];
          var activeElement = document.activeElement;
          if (!modal.contains(activeElement)) {
            event.preventDefault();
            firstFocusable.focus();
          } else if (event.shiftKey && activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          } else if (!event.shiftKey && activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
          return;
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          return;
        }
      }
      var tagName = event.target && event.target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (event.key === "ArrowRight") {
        var nextIndex = sections.findIndex(function (section) {
          return section.id === currentId;
        }) + 1;
        if (nextIndex < sections.length) {
          event.preventDefault();
          nextStep(sections[nextIndex].id);
        }
      }
      if (event.key === "ArrowLeft") {
        var previousIndex = sections.findIndex(function (section) {
          return section.id === currentId;
        }) - 1;
        if (previousIndex >= 0) {
          event.preventDefault();
          nextStep(sections[previousIndex].id);
        }
      }
    });

    function fallbackCopy(text) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      if (textarea.setSelectionRange) {
        textarea.setSelectionRange(0, text.length);
      }
      var copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(textarea);
      return copied;
    }

    function showCopyStatus(button, message) {
      var card = button.closest(".code-card");
      var status = card ? card.querySelector(".copy-status") : null;
      if (status) {
        status.textContent = message;
        status.setAttribute("aria-hidden", "false");
      }
      window.setTimeout(function () {
        if (status) {
          status.textContent = "";
          status.setAttribute("aria-hidden", "true");
        }
      }, 2400);
    }

    Array.prototype.slice.call(
      document.querySelectorAll("[data-copy-target]")
    ).forEach(function (button) {
      button.addEventListener("click", function () {
        var targetId = button.getAttribute("data-copy-target");
        var target = document.getElementById(targetId);
        if (!target) {
          return;
        }
        var text = target.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            showCopyStatus(button, "已複製到剪貼簿");
          }).catch(function () {
            showCopyStatus(
              button,
              fallbackCopy(text) ? "已複製到剪貼簿" : "請手動選取程式片段"
            );
          });
        } else {
          showCopyStatus(
            button,
            fallbackCopy(text) ? "已複製到剪貼簿" : "請手動選取程式片段"
          );
        }
      });
    });

    showStep(readStoredStep(), false);
  });
}());
