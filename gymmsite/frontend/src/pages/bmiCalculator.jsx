import React from "react";
import AllHeader from "../components/allHeader";
// import BmiLogo from "../assets/images/bmiLogo";
import BmiLogo from "../assets/logos/bmiLogo";

export default function BmiCalculator() {
    return (
        <div className="bmi-container">
            <AllHeader title="BMI Calculator" logo={<BmiLogo />} />
        </div>
    );
}