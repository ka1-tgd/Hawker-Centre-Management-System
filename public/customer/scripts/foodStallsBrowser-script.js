const hawkerCentres = document.querySelectorAll(".hawkerCentre");

hawkerCentres.forEach((centre) => {
  const nameElement = centre.querySelector("#hawkerCentreName");
  const addressElement = centre.querySelector("#hawkerCentreAddress");
  
  console.log("Hawker Centre Name:", nameElement.textContent);
  console.log("Address:", addressElement.textContent);

  const foodStalls = centre.querySelectorAll(".foodStall");
  
  foodStalls.forEach((stall) => {
    const stallName = stall.querySelector("#foodStallName").textContent;
    const stallStatus = stall.querySelector("#foodStallStatus").textContent;
    
    console.log(`-- Stall: ${stallName} | ${stallStatus}`);
  });
});