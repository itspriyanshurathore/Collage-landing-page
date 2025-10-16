document.addEventListener("DOMContentLoaded", async () => {
  // AOS.init();
  console.log("DOM Content Loaded - Initializing script.");

  // --- Dropdown Population ---
  const stateDropdown = document.getElementById("state");
  const cityDropdown = document.getElementById("city");
  const programDropdown = document.getElementById("program");
  const electiveDropdown = document.getElementById("elective");

  let statesData = [];
  let citiesData = [];
  let programsData = [];
  let electivesData = [];

  let statesResponse, citiesResponse, programsResponse, electivesResponse;
  try {
    try {
      statesResponse = await fetch("states.json");
      citiesResponse = await fetch("cities.json");
      programsResponse = await fetch("program.json");
      electivesResponse = await fetch("electives.json");

      console.log("All dropdown data loaded successfully.");
    } catch (error) {
      console.error("Dropdown loading error:", error.message);
    }

    statesData = await statesResponse.json();

    citiesData = await citiesResponse.json();

    programsData = await programsResponse.json();

    electivesData = await electivesResponse.json();

    statesData.forEach((state) => {
      const option = document.createElement("option");
      option.value = state.id;
      option.textContent = state.name;
      stateDropdown.appendChild(option);
    });

    programsData.forEach((program) => {
      const option = document.createElement("option");
      option.value = program.id;
      option.textContent = program.name;
      programDropdown.appendChild(option);
    });
    // console.log("Populated programDropdown with programs.");

    stateDropdown.addEventListener("change", function () {
      const stateId = parseInt(this.value);
      // console.log("Selected stateId:", stateId);

      cityDropdown.innerHTML =
        '<option value="" disabled selected>City*</option>';
      const filteredCities = citiesData.filter(
        (city) => city.stateId === stateId
      );
      // console.log("Filtered cities for stateId", stateId, ":", filteredCities);

      if (filteredCities.length === 0) {
        cityDropdown.innerHTML =
          '<option value="" disabled selected>No City Found</option>';
        // console.log("No cities found for stateId:", stateId);
      } else {
        filteredCities.forEach((city) => {
          const option = document.createElement("option");
          option.value = city.name;
          option.textContent = city.name;
          cityDropdown.appendChild(option);
        });
        // console.log("Populated cityDropdown with cities for stateId:", stateId);
      }
    });

    programDropdown.addEventListener("change", function () {
      const programId = parseInt(this.value);
      // console.log("Selected programId:", programId);

      electiveDropdown.innerHTML =
        '<option value="" disabled selected>Select Elective*</option>';
      const filteredElectives = electivesData.filter(
        (elective) => elective.entity1Id === programId
      );
      // console.log(
      //   "Filtered electives for programId",
      //   programId,
      //   ":",
      //   filteredElectives
      // );

      if (filteredElectives.length === 0) {
        electiveDropdown.innerHTML =
          '<option value="" disabled selected>No Result Found</option>';
        // console.log("No electives found for programId:", programId);
      } else {
        filteredElectives.forEach((elective) => {
          const option = document.createElement("option");
          option.value = elective.name;
          option.textContent = elective.name;
          electiveDropdown.appendChild(option);
        });
        // console.log(
        //   "Populated electiveDropdown with electives for programId:",
        //   programId
        // );
      }
    });
  } catch (error) {
    console.error("Error fetching JSON data:", error);
    alert("Failed to load dropdown data. Please try again later.");
  }

  // --- Form Submission Logic ---
  const form = document.getElementById("enquiry-form");
  const loader = document.getElementById("form-loader");
  // const thankYouSection = document.getElementById("thankyu");

  form.addEventListener("submit", async function (event) {
    console.log("Form submit event fired!");
    event.preventDefault();
    loader.classList.remove("hidden");

    // Checkbox Validation
    console.log("Validating terms checkbox...");
    const termsCheckbox = document.getElementById("terms-checkbox");
    if (!termsCheckbox.checked) {
      console.log("Terms checkbox not checked.");
      alert("Please agree to the terms to proceed.");
      loader.classList.add("hidden");
      return;
    }
    console.log("Terms checkbox validated.");

    // Extract URL Parameters
    console.log("Extracting URL parameters...");
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source") || "";
    const utmMedium = urlParams.get("utm_medium") || "";
    const utmCampaign = urlParams.get("utm_campaign") || "";
    const utmId = urlParams.get("utm_id") || "";
    const utmTerm = urlParams.get("utm_term") || "";
    const utmContent = urlParams.get("utm_content") || "";
    const collegeName = "Amity University";
    console.log("URL parameters:", { utmSource, utmCampaign, collegeName });

    // Collect Form Data
    console.log("Collecting form data...");
    const firstName = document.getElementById("first-name").value;
    const email = document.getElementById("email").value;
    const mobileNumber = document.getElementById("mobile-number").value;
    const city = document.getElementById("city").value;
    const state =
      document.getElementById("state").options[
        document.getElementById("state").selectedIndex
      ].text;
    const course =
      document.getElementById("program").options[
        document.getElementById("program").selectedIndex
      ].text;
    const center = document.getElementById("elective").value;

    // Prepare Payloads
    console.log("Preparing payloads...");
    const payload = {
      AuthToken: "futurestepsolutions_08-05-2025",
      Source: "futurestepsolution",
      FirstName: firstName,
      Email: email,
      MobileNumber: mobileNumber,
      Course: course,
      Center: center,
      Field15: collegeName || "",
      LeadSource: utmSource || "",
      LeadCampaign: utmCampaign || "",
      City: city,
      State: state,
    };
    const payload1 = {
      FirstName: firstName,
      Email: email,
      MobileNumber: mobileNumber,
      State: state,
      City: city,
      Course: course,
      Center: center,
      LeadCampaign: utmCampaign || "",
      LeadSource: utmSource || "",
      Field15: collegeName || "",
    };

    const urlEncodedBody = new URLSearchParams(payload1).toString();

    // Send Data to API (CRM)
    try {
      console.log("Sending data to CRM...");
      const crmResponse = await fetch(
        "https://publisher.extraaedge.com/api/Webhook/addPublisherLead",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (crmResponse.ok) {
        console.log(
          "CRM submission successful, sending data to Google Sheet..."
        );
        try {
          const googleResponse = await fetch(
            "https://script.google.com/macros/s/AKfycbxBSd2SmkCHlH4Jkdw-vFJEKGsIqrjPBw1SoaNrg3jwKIIN9NNJoXdgp9988vl1_itY/exec",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: urlEncodedBody,
            }
          );

          const googleResult = await googleResponse.json();
          if (googleResult.result === "ok") {
            console.log(
              "Google Sheet submission successful.",
              googleResult.result
            );
            loader.classList.add("hidden");

            // ✅ Redirect to actual thankyou.html page
            window.location.href = "thankyou.html";
          } else {
            console.error(
              "Google Sheet submission error:",
              googleResult.message
            );
            // alert(googleResult.message || "Failed to submit to Google Sheet");
          }
        } catch (googleError) {
          console.error("Failed to submit to Google Sheet:", googleError);
          // alert(
          //   "Form submitted to CRM, but failed to record in sheet: " +
          //     googleError.message
          // );
        }
      } else {
        const crmErrorText = await crmResponse.text();
        // console.error(
        //   "CRM submission failed:",
        //   crmResponse.status,
        //   crmErrorText
        // );
        throw new Error("Failed to submit to CRM: " + crmResponse.statusText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // alert("An error occurred: " + error.message);
    } finally {
      loader.classList.add("hidden");
    }
  });
});

const bachelorsTab = document.getElementById("bachelorsTab");
const mastersTab = document.getElementById("mastersTab");
const courseCards = document.querySelectorAll(".course-card");


// ----- TAB SWITCHING -----
bachelorsTab.addEventListener("click", () => {
  bachelorsTab.classList.add("bg-blue-900", "text-white");
  bachelorsTab.classList.remove("bg-white", "text-blue-500", "border");
  mastersTab.classList.remove("bg-blue-900", "text-white");
  mastersTab.classList.add(
    "bg-white",
    "text-blue-900",
    "border",
    "border-blue-900"
  );

  courseCards.forEach((card) => {
    card.dataset.type === "bachelor"
      ? card.classList.remove("hidden")
      : card.classList.add("hidden");
  });

  resetSlider();
});

mastersTab.addEventListener("click", () => {
  mastersTab.classList.add("bg-blue-900", "text-white");
  mastersTab.classList.remove("bg-white", "text-blue-900", "border");
  bachelorsTab.classList.remove("bg-blue-900", "text-white");
  bachelorsTab.classList.add(
    "bg-white",
    "text-blue-900",
    "border",
    "border-blue-900"
  );

  courseCards.forEach((card) => {
    card.dataset.type === "master"
      ? card.classList.remove("hidden")
      : card.classList.add("hidden");
  });

  resetSlider();
});

// ----- SLIDER LOGIC -----
const slider = document.getElementById("testimonialSlider");
const dots = document.querySelectorAll("[data-index]");
let currentIndex = 0;

function goToSlide(index) {
  slider.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot) => dot.classList.remove("bg-yellow-400"));
  dots[index].classList.add("bg-yellow-400");
  currentIndex = index;
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => goToSlide(dot.dataset.index));
});

// Auto slide every 2 seconds
setInterval(() => {
  let nextIndex = (currentIndex + 1) % dots.length;
  goToSlide(nextIndex);
}, 2000);

// Initialize first slide
goToSlide(0);

// Detect when cards enter viewport
const cards = document.querySelectorAll(".adv-card");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.3 }
);


