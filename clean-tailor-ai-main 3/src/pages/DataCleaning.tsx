import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUpload from "@/components/FileUpload";
import DataChat from "@/components/DataChat";
import AnalysisResults from "@/components/AnalysisResults";

const DataCleaning = () => {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [csvText, setCsvText] = useState<string>("");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {!datasetId ? (
          <FileUpload
            onUploadComplete={(id, analysis, csv) => {
              setDatasetId(id);
              setAnalysisData(analysis);
              setCsvText(csv);
            }}
          />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DataChat datasetId={datasetId} analysisData={analysisData} csvText={csvText} />
              </div>
              <div className="lg:col-span-1">
                <AnalysisResults analysisData={analysisData} />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DataCleaning;
