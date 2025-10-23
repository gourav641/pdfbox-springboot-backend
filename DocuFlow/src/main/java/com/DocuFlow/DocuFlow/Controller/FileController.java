package com.DocuFlow.DocuFlow.Controller;

import com.DocuFlow.DocuFlow.Entity.Entity;
import com.DocuFlow.DocuFlow.Service.DocuFlowService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/upload")
public class FileController {
    @Autowired
    private DocuFlowService docuFlowService;

    @PostMapping
    private ResponseEntity<?> createpdfFiles(@RequestParam("files") List<MultipartFile> files) throws IOException {
        try {
            byte[] pdfBytes = docuFlowService.createpdf(files);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"")
                    .body(pdfBytes);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @PostMapping("/compress")
    public ResponseEntity<byte[]> compressPdf(@RequestParam("file") MultipartFile file) {
        try {
            byte[] compressed = docuFlowService.compressPdf(file.getInputStream());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename("compressed.pdf").build());

            return new ResponseEntity<>(compressed, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/merge")
    public ResponseEntity<byte[]> pdfMerge(@RequestParam("files") MultipartFile[] files) {
        try {
            byte[] mergedpdf = docuFlowService.mergePdf(files);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=merged.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(mergedpdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removePdfpage(@RequestParam("file") MultipartFile file, @RequestParam("Pagenumber") int pageNo) {
        try {
            byte[] newPdf = docuFlowService.removePage(file.getInputStream(), pageNo - 1);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"")
                    .body(newPdf);
        }  catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}