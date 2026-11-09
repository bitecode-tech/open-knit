package bitecode.modules.document;

import bitecode.modules._common.utils.TestDataFactory;
import bitecode.modules.document._config.DocumentIntegrationTest;
import bitecode.modules.document.model.data.DocumentDetails;
import bitecode.modules.document.model.enums.DocumentStorageType;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class DocumentControllerTest extends DocumentIntegrationTest {
    private static final String ADMIN_DOCUMENTS_PATH = "/api/admin/documents";
    private static final String USER_DOCUMENTS_PATH = "/api/documents";

    private TestDataFactory.TestUserData adminUserData;

    @BeforeAll
    void setup() {
        adminUserData = testDataFactory.createAdminUser();
    }

    @Test
    @DisplayName("Admin should upload list and delete documents through admin endpoints")
    void shouldUploadListAndDeleteDocumentsAsAdmin() throws IOException {
        var uploadedDocument = uploadDocument(ADMIN_DOCUMENTS_PATH, adminUserData.accessToken(), "admin-notes.txt", "admin content");

        var storedDocument = documentRepository.findByUuid(uploadedDocument.uuid()).orElseThrow();
        var expectedDocumentPath = resolveDocumentPath(storedDocument.getUserId(), storedDocument.getStoredFilename());

        assertThat(uploadedDocument.userId(), is(adminUserData.user().getUuid()));
        assertThat(uploadedDocument.filename(), is("admin-notes.txt"));
        assertThat(uploadedDocument.storageType(), is(DocumentStorageType.LOCAL));
        assertThat(storedDocument.getStoredFilename(), startsWith("admin-notes.txt-"));
        assertThat(Files.exists(expectedDocumentPath), is(true));
        assertThat(Files.readString(expectedDocumentPath), is("admin content"));

        // @formatter:off
        given()
                .auth().oauth2(adminUserData.accessToken())
        .when()
                .get(ADMIN_DOCUMENTS_PATH)
        .then()
                .statusCode(200)
                .body("content.size()", is(1))
                .body("content[0].uuid", is(uploadedDocument.uuid().toString()))
                .body("content[0].userId", is(adminUserData.user().getUuid().toString()))
                .body("content[0].filename", is("admin-notes.txt"))
                .body("content[0].storageType", is(DocumentStorageType.LOCAL.name()))
                .body("content[0]", not(hasKey("user_id")))
                .body("content[0]", not(hasKey("storage_type")));
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(adminUserData.accessToken())
        .when()
                .get(ADMIN_DOCUMENTS_PATH + "/" + uploadedDocument.uuid())
        .then()
                .statusCode(200)
                .body("uuid", is(uploadedDocument.uuid().toString()))
                .body("filename", is("admin-notes.txt"))
                .body("fileType", is("text/plain"))
                .body("", not(hasKey("file_type")));
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(adminUserData.accessToken())
        .when()
                .get(ADMIN_DOCUMENTS_PATH + "/" + uploadedDocument.uuid() + "/download")
        .then()
                .statusCode(200)
                .contentType("text/plain")
                .body(is("admin content"));
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(adminUserData.accessToken())
        .when()
                .delete(ADMIN_DOCUMENTS_PATH + "/" + uploadedDocument.uuid())
        .then()
                .statusCode(200);
        // @formatter:on

        assertThat(documentRepository.findByUuid(uploadedDocument.uuid()).isEmpty(), is(true));
        assertThat(Files.exists(expectedDocumentPath), is(false));
    }

    @Test
    @DisplayName("User should upload list and delete only own documents")
    void shouldUploadListAndDeleteOwnDocumentsAsUser() throws IOException {
        var firstUserData = testDataFactory.createTestUser("document-first-user");
        var secondUserData = testDataFactory.createTestUser("document-second-user");

        var firstUserDocument = uploadDocument(USER_DOCUMENTS_PATH, firstUserData.accessToken(), "first-user.txt", "first user content");
        var secondUserDocument = uploadDocument(USER_DOCUMENTS_PATH, secondUserData.accessToken(), "second-user.txt", "second user content");
        var firstStoredFilename = documentRepository.findByUuid(firstUserDocument.uuid()).orElseThrow().getStoredFilename();
        var secondStoredFilename = documentRepository.findByUuid(secondUserDocument.uuid()).orElseThrow().getStoredFilename();

        var firstUserDocumentPath = resolveDocumentPath(firstUserData.user().getUuid(), firstStoredFilename);
        var secondUserDocumentPath = resolveDocumentPath(secondUserData.user().getUuid(), secondStoredFilename);

        // @formatter:off
        given()
                .auth().oauth2(firstUserData.accessToken())
        .when()
                .get(USER_DOCUMENTS_PATH)
        .then()
                .statusCode(200)
                .body("content.size()", is(1))
                .body("content[0].uuid", is(firstUserDocument.uuid().toString()))
                .body("content[0].userId", is(firstUserData.user().getUuid().toString()))
                .body("content[0].filename", is("first-user.txt"))
                .body("content[0]", not(hasKey("user_id")));
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(firstUserData.accessToken())
        .when()
                .get(USER_DOCUMENTS_PATH + "/" + firstUserDocument.uuid())
        .then()
                .statusCode(200)
                .body("uuid", is(firstUserDocument.uuid().toString()))
                .body("filename", is("first-user.txt"));
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(firstUserData.accessToken())
        .when()
                .get(USER_DOCUMENTS_PATH + "/" + firstUserDocument.uuid() + "/download")
        .then()
                .statusCode(200)
                .contentType("text/plain")
                .body(is("first user content"));
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(firstUserData.accessToken())
        .when()
                .get(USER_DOCUMENTS_PATH + "/" + secondUserDocument.uuid())
        .then()
                .statusCode(404);
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(firstUserData.accessToken())
        .when()
                .delete(USER_DOCUMENTS_PATH + "/" + secondUserDocument.uuid())
        .then()
                .statusCode(404);
        // @formatter:on

        // @formatter:off
        given()
                .auth().oauth2(firstUserData.accessToken())
        .when()
                .delete(USER_DOCUMENTS_PATH + "/" + firstUserDocument.uuid())
        .then()
                .statusCode(200);
        // @formatter:on

        assertThat(documentRepository.findByUuid(firstUserDocument.uuid()).isEmpty(), is(true));
        assertThat(documentRepository.findByUuid(secondUserDocument.uuid()).isPresent(), is(true));
        assertThat(Files.exists(firstUserDocumentPath), is(false));
        assertThat(Files.exists(secondUserDocumentPath), is(true));
        assertThat(Files.readString(secondUserDocumentPath), is("second user content"));
    }

    @Test
    @DisplayName("User should not access admin document endpoints")
    void shouldRejectUserAccessToAdminDocumentsEndpoint() {
        var userData = testDataFactory.createTestUser("document-admin-access-user");

        // @formatter:off
        given()
                .auth().oauth2(userData.accessToken())
        .when()
                .get(ADMIN_DOCUMENTS_PATH)
        .then()
                .statusCode(403);
        // @formatter:on
    }

    private DocumentDetails uploadDocument(String path, String accessToken, String filename, String fileContent) {
        // @formatter:off
        return given()
                .auth().oauth2(accessToken)
                .contentType(ContentType.MULTIPART)
                .multiPart("files", filename, fileContent.getBytes(StandardCharsets.UTF_8), "text/plain")
        .when()
                .post(path)
        .then()
                .statusCode(201)
                .body("[0].userId", notNullValue())
                .body("[0].fileSize", notNullValue())
                .body("[0]", not(hasKey("user_id")))
                .extract()
                .body()
                .as(DocumentDetails[].class)[0];
        // @formatter:on
    }

    private Path resolveDocumentPath(UUID userId, String storedFilename) {
        return getStorageBasePath().resolve(userId.toString()).resolve(storedFilename);
    }
}
