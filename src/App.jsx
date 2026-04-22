import React, { useState, useMemo } from 'react';
import { Plus, X, ArrowRight, Calculator, AlertCircle, Info, Target, BookOpen, GraduationCap } from 'lucide-react';

const SCALES = {
  NIGERIAN: 'nigerian',
  INTERNATIONAL: 'international'
};

const getScaleInfo = (scale) => {
  if (scale === SCALES.NIGERIAN) {
    return {
      maxCgpa: 5.0,
      name: 'Nigerian 5.0',
      tiers: [
        { maxReq: 0.0, grade: 'F', point: 0.0, minScore: 0 },
        { maxReq: 1.0, grade: 'E', point: 1.0, minScore: 40 },
        { maxReq: 2.0, grade: 'D', point: 2.0, minScore: 45 },
        { maxReq: 3.0, grade: 'C', point: 3.0, minScore: 50 },
        { maxReq: 4.0, grade: 'B', point: 4.0, minScore: 60 },
        { maxReq: 5.0, grade: 'A', point: 5.0, minScore: 70 },
      ],
      messages: [
        { max: 2.5, color: 'text-green-700 bg-green-50 border-green-200', text: "You're in a comfortable position. Stay consistent." },
        { max: 3.5, color: 'text-blue-700 bg-blue-50 border-blue-200', text: "This is achievable with focused effort." },
        { max: 4.5, color: 'text-amber-700 bg-amber-50 border-amber-200', text: "This will require strong performance across all courses." },
        { max: 5.0, color: 'text-orange-700 bg-orange-50 border-orange-200', text: "This is very difficult but mathematically possible. You need near-perfect scores." },
      ],
      impossibleText: "This target is not reachable this semester given your current standing. Consider adjusting your target.",
      impossibleColor: 'text-red-700 bg-red-50 border-red-200'
    };
  } else {
    return {
      maxCgpa: 4.0,
      name: 'International 4.0',
      tiers: [
        { maxReq: 0.0, grade: 'F', point: 0.0, minScore: 0 },
        { maxReq: 1.0, grade: 'D', point: 1.0, minScore: 60 },
        { maxReq: 2.0, grade: 'C', point: 2.0, minScore: 70 },
        { maxReq: 3.0, grade: 'B', point: 3.0, minScore: 80 },
        { maxReq: 4.0, grade: 'A', point: 4.0, minScore: 90 },
      ],
      messages: [
        { max: 2.0, color: 'text-green-700 bg-green-50 border-green-200', text: "You're in a comfortable position. Stay consistent." },
        { max: 2.8, color: 'text-blue-700 bg-blue-50 border-blue-200', text: "This is achievable with focused effort." },
        { max: 3.6, color: 'text-amber-700 bg-amber-50 border-amber-200', text: "This will require strong performance across all courses." },
        { max: 4.0, color: 'text-orange-700 bg-orange-50 border-orange-200', text: "This is very difficult but mathematically possible. You need near-perfect scores." },
      ],
      impossibleText: "This target is not reachable this semester given your current standing. Consider adjusting your target.",
      impossibleColor: 'text-red-700 bg-red-50 border-red-200'
    };
  }
};

export default function App() {
  const [scale, setScale] = useState(SCALES.NIGERIAN);

  const [currentCgpa, setCurrentCgpa] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [targetCgpa, setTargetCgpa] = useState('');

  const [courses, setCourses] = useState([
    { id: 1, name: '', credits: '' },
    { id: 2, name: '', credits: '' },
    { id: 3, name: '', credits: '' },
  ]);

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const scaleInfo = getScaleInfo(scale);

  // Auto-recalculate if results are showing
  React.useEffect(() => {
    if (result) {
      calculate();
    }
    // clear errors related to limits if they switch scale
    setErrors([]);
  }, [scale]);

  const addCourse = () => {
    if (courses.length < 15) {
      setCourses([...courses, { id: Date.now(), name: '', credits: '' }]);
    }
  };

  const removeCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculate = () => {
    const newErrors = [];

    if (courses.length > 15) {
      setErrors(["Maximum of 15 courses allowed"]);
      setResult(null);
      return;
    }

    const curCgpa = parseFloat(currentCgpa);
    const totUnits = parseInt(totalUnits, 10);
    const tgtCgpa = parseFloat(targetCgpa);

    if (isNaN(curCgpa) || curCgpa < 0 || curCgpa > scaleInfo.maxCgpa) {
      newErrors.push(`Current CGPA must be between 0.00 and ${scaleInfo.maxCgpa.toFixed(2)}.`);
    }
    if (isNaN(totUnits) || totUnits < 1 || !Number.isInteger(totUnits)) {
      newErrors.push("Total units must be a positive whole number.");
    }
    if (isNaN(tgtCgpa) || tgtCgpa < 0.01 || tgtCgpa > scaleInfo.maxCgpa) {
      newErrors.push(`Target CGPA must be between 0.01 and ${scaleInfo.maxCgpa.toFixed(2)}.`);
    }
    if (!isNaN(curCgpa) && !isNaN(tgtCgpa) && tgtCgpa <= curCgpa) {
      newErrors.push("Target CGPA must be greater than your current CGPA.");
    }

    let semesterUnits = 0;
    let hasCourseError = false;
    courses.forEach((c, i) => {
      const credits = parseInt(c.credits, 10);
      if (isNaN(credits) || credits < 1 || credits > 6) {
        if (!hasCourseError) {
          newErrors.push(`Course ${i + 1} must have credit units between 1 and 6.`);
          hasCourseError = true;
        }
      } else {
        semesterUnits += credits;
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setResult(null);
      return;
    }

    setErrors([]);

    // Formula: 
    // Target CGPA = (Current CGPA * Total Units + Semester Grade Points) / (Total Units + Semester Units)
    // Target Semester Grade Points = Target CGPA * (Total Units + Semester Units) - Current CGPA * Total Units
    const targetSemesterGradePoints = (tgtCgpa * (totUnits + semesterUnits)) - (curCgpa * totUnits);
    const requiredSemesterGpa = targetSemesterGradePoints / semesterUnits;

    const isImpossible = requiredSemesterGpa > scaleInfo.maxCgpa;

    let targetTier = null;
    if (!isImpossible) {
      targetTier = scaleInfo.tiers.find(t => requiredSemesterGpa <= t.maxReq) || scaleInfo.tiers[scaleInfo.tiers.length - 1];
    }

    let messageObj = null;
    if (isImpossible) {
      messageObj = { text: scaleInfo.impossibleText, color: scaleInfo.impossibleColor };
    } else {
      messageObj = scaleInfo.messages.find(m => requiredSemesterGpa <= m.max) || scaleInfo.messages[scaleInfo.messages.length - 1];
    }

    // Projected CGPA calculation if they achieve exactly the required discrete tier
    const achievedGradePoints = targetTier ? targetTier.point * semesterUnits : targetSemesterGradePoints;
    const projectedCgpa = (curCgpa * totUnits + achievedGradePoints) / (totUnits + semesterUnits);

    setResult({
      requiredSemesterGpa,
      isImpossible,
      targetTier,
      messageObj,
      projectedCgpa,
      semesterUnits
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header & Scale Toggle */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-2 shadow-sm border border-indigo-100">
            <Calculator className="w-4 h-4" />
            <span>CGPA Simulator</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Plan your next semester
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Find out exactly what grades you need to hit your target CGPA.
          </p>

          <div className="flex justify-center items-center mt-6">
            <div className="bg-gray-200/80 p-1 rounded-xl inline-flex relative shadow-inner">
              <button
                onClick={() => setScale(SCALES.NIGERIAN)}
                className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${scale === SCALES.NIGERIAN ? 'text-gray-900 shadow-sm bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Nigerian 5.0
              </button>
              <button
                onClick={() => setScale(SCALES.INTERNATIONAL)}
                className={`relative z-10 px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${scale === SCALES.INTERNATIONAL ? 'text-gray-900 shadow-sm bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                International 4.0
              </button>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Card 1: Current standing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Current Standing</h2>
            </div>
            <div className="p-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current CGPA</label>
                <input
                  type="number"
                  min="0.00"
                  max={scaleInfo.maxCgpa}
                  step="0.01"
                  required
                  value={currentCgpa}
                  onChange={(e) => setCurrentCgpa(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 transition-colors sm:text-sm"
                  placeholder={`e.g. ${(scaleInfo.maxCgpa * 0.7).toFixed(2)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Units Completed</label>
                <input
                  type="number"
                  min="1"
                  max="400"
                  required
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 transition-colors sm:text-sm"
                  placeholder="e.g. 64"
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> check your transcript</p>
              </div>
            </div>
          </div>

          {/* Card 2: Next semester courses */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Next Semester Courses</h2>
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                {courses.length} / 15
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                  <div className="col-span-7 sm:col-span-8">Course Name (Optional)</div>
                  <div className="col-span-4 sm:col-span-3">Units</div>
                  <div className="col-span-1 text-right"></div>
                </div>
                {courses.map((course, idx) => (
                  <div key={course.id} className="grid grid-cols-12 gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="col-span-7 sm:col-span-8">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 transition-colors sm:text-sm"
                        placeholder={`Course ${idx + 1}`}
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <input
                        type="number"
                        min="1"
                        max="6"
                        required
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                        className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 transition-colors sm:text-sm text-center"
                        placeholder="e.g. 3"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeCourse(course.id)}
                        disabled={courses.length <= 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors p-2"
                        title="Remove course"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {courses.length < 15 && (
                <button
                  type="button"
                  onClick={addCourse}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all w-full justify-center group"
                >
                  <Plus className="w-4 h-4 mr-2 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  Add Course
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Target */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Your Target</h2>
            </div>
            <div className="p-6">
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target CGPA</label>
                <input
                  type="number"
                  min="0.01"
                  max={scaleInfo.maxCgpa}
                  step="0.01"
                  required
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 bg-gray-50 border px-4 py-3 text-gray-900 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 transition-colors sm:text-sm text-lg font-semibold"
                  placeholder={`e.g. ${scaleInfo.maxCgpa.toFixed(2)}`}
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center"><Info className="w-3 h-3 mr-1" /> must be higher than your current CGPA</p>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculate}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.99]"
          >
            Calculate Requirements
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <div className="mt-12 pt-10 border-t border-gray-200 animate-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Your Plan</h2>
              <p className="mt-2 text-gray-500">Here is what you need to achieve your goal.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Target className="w-24 h-24" />
                </div>
                <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Min. GPA needed next semester</dt>
                <dd className={`mt-3 text-5xl font-black ${result.isImpossible ? 'text-red-500' : 'text-indigo-600'}`}>
                  {result.requiredSemesterGpa.toFixed(2)}
                </dd>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <GraduationCap className="w-24 h-24" />
                </div>
                <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Projected CGPA if achieved</dt>
                <dd className="mt-3 text-5xl font-black text-gray-900">
                  {result.isImpossible ? '—' : result.projectedCgpa.toFixed(2)}
                </dd>
                {!result.isImpossible && result.targetTier && result.projectedCgpa > parseFloat(targetCgpa) && (
                  <p className="mt-2 text-xs text-emerald-600 font-medium">Exceeds target due to grade tiers</p>
                )}
              </div>
            </div>

            {/* Contextual Message */}
            <div className={`rounded-xl p-5 border ${result.messageObj.color} flex items-start`}>
              <Info className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p className="font-medium text-sm sm:text-base leading-relaxed">{result.messageObj.text}</p>
            </div>

            {/* Per-course Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Per-course Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Units</th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Grade</th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course, idx) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {course.name.trim() || `Course ${idx + 1}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {course.credits || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-bold ${result.isImpossible ? 'bg-gray-100 text-gray-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {result.isImpossible ? 'N/A' : result.targetTier.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-center">
                          {result.isImpossible ? 'N/A' : `${result.targetTier.minScore}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
}
