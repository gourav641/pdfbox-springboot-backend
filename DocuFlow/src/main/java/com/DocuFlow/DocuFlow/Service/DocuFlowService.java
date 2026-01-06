package com.DocuFlow.DocuFlow.Service;

import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@Service
public class DocuFlowService {

public byte[] createpdf(List<MultipartFile> files) throws IOException {
        PDDocument document = new PDDocument();
        for (MultipartFile imagefiles : files) {
            PDPage page = new PDPage();
            document.addPage(page);
            addImageToPage(document, page, imagefiles);
        }
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        return baos.toByteArray();
}
public void addImageToPage(PDDocument document,PDPage page,MultipartFile imagefile) throws IOException{
    PDImageXObject pdImage=PDImageXObject.createFromByteArray(document, imagefile.getBytes(), imagefile.getOriginalFilename());
   try
           ( PDPageContentStream contentStream = new PDPageContentStream(document, page)){;
       float pageWidth = page.getMediaBox().getWidth();
       float pageHeight = page.getMediaBox().getHeight();
       float imageWidth = pdImage.getWidth();
       float imageHeight = pdImage.getHeight();

       // Calculate scale to fit the image on the page
       float scale = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
       float newWidth = imageWidth * scale;
       float newHeight = imageHeight * scale;

       // Calculate position to center the image on the page
       float x = (pageWidth - newWidth) / 2;
       float y = (pageHeight - newHeight) / 2;
       contentStream.drawImage(pdImage, x, y, newWidth, newHeight);
   }
}
public byte[] compressPdf(InputStream input) throws IOException{
    //load original pdf
    PDDocument originalDoc=PDDocument.load(input);
     PDFRenderer renderer=new PDFRenderer(originalDoc);
     //create new pdf
     PDDocument  compressedDoc=new PDDocument();

     for(int i=1;i< originalDoc.getNumberOfPages();i++) {
         BufferedImage image = renderer.renderImageWithDPI(i, 100);
         PDPage page = new PDPage();
         compressedDoc.addPage(page);

         PDImageXObject imageObject = JPEGFactory.createFromImage(compressedDoc, image);

         PDPageContentStream contentStream = new PDPageContentStream(compressedDoc, page);
         contentStream.drawImage(imageObject, 20, 20, page.getMediaBox().getWidth() - 40, page.getMediaBox().getHeight() - 40);
         contentStream.close();
     }
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    compressedDoc.save(output);
    compressedDoc.close();
    originalDoc.close();

    return output.toByteArray();
   }
   public byte[] mergePdf(MultipartFile [] files) throws IOException {

       try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
           PDFMergerUtility merger = new PDFMergerUtility();
           merger.setDestinationStream(outputStream);

           for (MultipartFile file : files) {
               try (InputStream inputStream = file.getInputStream()) {
                   merger.addSource(inputStream);
               }
           }
           merger.mergeDocuments(null);
           return outputStream.toByteArray();
       }
   }
   public byte[] removePage( InputStream input,int n) throws IOException {
       try (PDDocument exsistingpdf = PDDocument.load(input);
            ByteArrayOutputStream output = new ByteArrayOutputStream()) {
           int totalPages = exsistingpdf.getNumberOfPages();
           if(n<1 || n> totalPages){
               throw new IllegalArgumentException("Invalid page number. Must be between 0 and " + (totalPages - 1));
           }
           exsistingpdf.removePage(n);

           exsistingpdf.save(output);
           exsistingpdf.close();
           return output.toByteArray();
       }
   }
   public byte[] protectPdf(InputStream input,
                            String ownerPassword,
                            String userPassword,
                            boolean allowPrinting,
                            boolean allowContentExtraction){
    try(
            PDDocument document=PDDocument.load(input);
            ByteArrayOutputStream output=new ByteArrayOutputStream()
            ){
        AccessPermission accessPermission=new AccessPermission();
        accessPermission.setCanPrint(allowPrinting);
        accessPermission.setCanExtractContent(allowContentExtraction);

        StandardProtectionPolicy policy=new StandardProtectionPolicy(ownerPassword,userPassword,accessPermission);
        policy.setEncryptionKeyLength(256);
        policy.setPermissions(accessPermission);
        document.protect(policy);
        document.save(output);
        return output.toByteArray();
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
   }
}
